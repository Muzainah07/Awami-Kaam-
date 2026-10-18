/**
 * Data Access and Service Layer for Awami Kam (عوامی کام)
 * 
 * Connected to Supabase backend:
 * - Realtime subscriptions for job offers & status updates
 * - Phone OTP & anonymous guest auth with role locking in profiles
 * - RLS-guarded queries with fallback to seeded/local data
 * - RPC get_job_contact for privacy-preserving phone unmasking
 */

import {
  UserSession,
  UserRole,
  WorkerProfile,
  JobOffer,
  ActiveJob,
  JobBookingRequest,
  MatchedWorkerOption,
  WorkerEarnings,
  FairPriceAssessment,
  ImpactMetrics,
  SkillType,
  SkillDefinition,
  JobListing,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_WORKER, DEMO_HIRER } from '../config/demo';
import { calculateHaversineDistance, scoreWorkerForJob } from './matching';
import { AREA_COORDINATES, SEEDED_WORKERS, SEEDED_JOBS } from '../data/seed';

export const SKILL_DEFINITIONS: Record<SkillType, SkillDefinition> = {
  painter: {
    id: 'painter',
    labelEn: 'Painter',
    labelUr: 'رنگ ساز / پینٹر',
    icon: '🎨',
    baseMinRate: 3000,
    baseMaxRate: 4500,
    baseAvgRate: 3800,
    unit: 'rooms',
  },
  plumber: {
    id: 'plumber',
    labelEn: 'Plumber',
    labelUr: 'پلمبر / نل ساز',
    icon: '🔧',
    baseMinRate: 3000,
    baseMaxRate: 5000,
    baseAvgRate: 4000,
    unit: 'bathrooms',
  },
  electrician: {
    id: 'electrician',
    labelEn: 'Electrician',
    labelUr: 'الیکٹریشن',
    icon: '⚡',
    baseMinRate: 3500,
    baseMaxRate: 5500,
    baseAvgRate: 4300,
    unit: 'points',
  },
  carpenter: {
    id: 'carpenter',
    labelEn: 'Carpenter',
    labelUr: 'بڑھئی / کارپینٹر',
    icon: '🪚',
    baseMinRate: 3500,
    baseMaxRate: 5500,
    baseAvgRate: 4400,
    unit: 'items',
  },
  mason: {
    id: 'mason',
    labelEn: 'Mason',
    labelUr: 'راج / مستری',
    icon: '🧱',
    baseMinRate: 3500,
    baseMaxRate: 5200,
    baseAvgRate: 4300,
    unit: 'sq ft',
  },
  helper: {
    id: 'helper',
    labelEn: 'Helper',
    labelUr: 'مزدور / ہیلپر',
    icon: '💪',
    baseMinRate: 1800,
    baseMaxRate: 2600,
    baseAvgRate: 2200,
    unit: 'hours',
  },
  ac_technician: {
    id: 'ac_technician',
    labelEn: 'AC Technician',
    labelUr: 'اے سی ٹیکنیشن',
    icon: '❄️',
    baseMinRate: 3500,
    baseMaxRate: 5500,
    baseAvgRate: 4500,
    unit: 'units',
  },
  cleaner: {
    id: 'cleaner',
    labelEn: 'Cleaner',
    labelUr: 'صفائی کاریگر',
    icon: '🧹',
    baseMinRate: 2000,
    baseMaxRate: 3200,
    baseAvgRate: 2500,
    unit: 'hours',
  },
  laborer: {
    id: 'laborer',
    labelEn: 'Laborer',
    labelUr: 'مزدور',
    icon: '💪',
    baseMinRate: 1800,
    baseMaxRate: 2600,
    baseAvgRate: 2200,
    unit: 'hours',
  },
  tile_worker: {
    id: 'tile_worker',
    labelEn: 'Tile Worker',
    labelUr: 'ٹائل مستری',
    icon: '📐',
    baseMinRate: 3800,
    baseMaxRate: 5500,
    baseAvgRate: 4600,
    unit: 'sq ft',
  },
  welder: {
    id: 'welder',
    labelEn: 'Welder',
    labelUr: 'ویلڈر',
    icon: '🔥',
    baseMinRate: 3500,
    baseMaxRate: 5200,
    baseAvgRate: 4100,
    unit: 'items',
  },
};

export const KARACHI_AREAS = [
  'Gulshan-e-Iqbal',
  'Liaquatabad',
  'Saddar',
  'Orangi Town',
  'Nazimabad',
  'Korangi',
  'Malir',
  'Federal B Area',
  'Clifton',
  'DHA',
  'North Nazimabad',
  'Landhi',
];

// Fallback seed worker for offline/unconfigured mode
const FALLBACK_WORKER_PROFILE: WorkerProfile = {
  id: 'b0000000-0000-0000-0000-000000000001',
  name: 'Ahmed Khan',
  phone: '0301-***8421',
  phoneFull: '0301-4458421',
  detected_language: 'Urdu',
  language_code: 'ur',
  primary_skill: 'painter',
  skills: ['House Painting', 'Enamel Polish', 'Wall Putty', 'Texture'],
  location_area: 'Liaquatabad',
  city: 'Karachi',
  latitude: 24.9080,
  longitude: 67.0435,
  availability: 'today',
  is_online: true,
  experience_years: 9,
  expected_daily_rate_pkr: 3800,
  reliability_score: 4.9,
  completed_jobs_count: 74,
  badge: 'Master Craftsman',
  voice_intro_text: 'احمد خان - لیاقت آباد، پینٹر، ۹ سال کا تجربہ',
  avatar_color: '#0B6B3A',
  confidence: 0.98,
};

const INITIAL_JOB_OFFERS: JobOffer[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    job_id: 'c0000000-0000-0000-0000-000000000001',
    worker_id: 'b0000000-0000-0000-0000-000000000001',
    job_title: '2 Rooms Wall Painting',
    skill: 'painter',
    area: 'Gulshan-e-Iqbal',
    city: 'Karachi',
    rate_pkr: 3800,
    date: 'Today',
    distance_km: 3.4,
    urgency: 'normal',
    voice_message_ur: 'احمد بھائی، گلشن اقبال میں دو کمروں کی پینٹنگ کی نوکری ہے۔ مزدوری ۳۸۰۰ روپے ہے۔ کیا آپ جانا چاہتے ہیں؟',
    voice_message_en: 'Ahmed bhai, 2 rooms wall painting job in Gulshan-e-Iqbal for 3,800 PKR. Do you want to accept?',
    is_below_market: false,
    status: 'pending',
    created_at: 'Just now',
  },
];

class ApiService {
  private sessionKey = 'awamikam_session';
  private workerKey = 'awamikam_worker_profile';
  private offersKey = 'awamikam_offers';
  private activeJobKey = 'awamikam_active_job';
  private earningsKey = 'awamikam_earnings';
  private hirerJobsKey = 'awamikam_hirer_jobs';

  // Helper: Format Pakistani phone to E.164 (+923011234567)
  private formatPhoneE164(phone: string): string {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+92')) return cleaned;
    if (cleaned.startsWith('92')) return `+${cleaned}`;
    if (cleaned.startsWith('03')) return `+92${cleaned.substring(1)}`;
    if (cleaned.startsWith('3')) return `+92${cleaned}`;
    return cleaned.startsWith('+') ? cleaned : `+92${cleaned}`;
  }

  // ==========================================
  // AUTH & SESSION
  // ==========================================

  getCurrentSession(): UserSession | null {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    if (!phone || !phone.trim()) return { success: false, error: 'Phone number is required' };
    if (isSupabaseConfigured()) {
      try {
        const formatted = this.formatPhoneE164(phone);
        const { error } = await supabase.auth.signInWithOtp({
          phone: formatted,
        });
        if (error) {
          console.warn('Supabase SMS OTP notice:', error.message);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        console.warn('Supabase OTP fallback:', err);
        return { success: false, error: err?.message || 'Failed to dispatch SMS' };
      }
    }
    return { success: true };
  }

  async loginWithPhone(phone: string, otp: string, role: UserRole): Promise<UserSession> {
    const formattedPhone = this.formatPhoneE164(phone || (role === 'worker' ? '0301-4458421' : '0333-2211948'));
    let userId = role === 'worker' ? 'a0000000-0000-0000-0000-000000000001' : 'a0000000-0000-0000-0000-000000000002';
    const userName = role === 'worker' ? 'Ahmed Khan' : 'Dr. Bilal Qureshi';

    if (isSupabaseConfigured()) {
      try {
        // Attempt OTP verification with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        });

        if (!authError && authData?.user) {
          userId = authData.user.id;
        }

        // Store role in profiles table (Role is locked after creation)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (existingProfile) {
          if (existingProfile.role && existingProfile.role !== role) {
            throw new Error(`This account is registered as ${existingProfile.role}. Role cannot be changed.`);
          }
        } else {
          // Create profile record
          await supabase.from('profiles').upsert({
            id: userId,
            name: userName,
            phone: phone,
            role: role,
            is_guest: false,
            updated_at: new Date().toISOString(),
          });
        }

        // If worker, ensure a worker row exists
        if (role === 'worker') {
          const { data: existingWorker } = await supabase
            .from('workers')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          if (!existingWorker) {
            await supabase.from('workers').insert({
              user_id: userId,
              name: userName,
              phone: phone,
              detected_language: 'Urdu',
              language_code: 'ur',
              primary_skill: 'painter',
              skills: ['House Painting', 'Enamel Polish', 'Wall Putty', 'Texture'],
              location_area: 'Liaquatabad',
              city: 'Karachi',
              latitude: 24.9080,
              longitude: 67.0435,
              availability: 'today',
              is_online: true,
              experience_years: 9,
              expected_daily_rate_pkr: 3800,
              reliability_score: 4.9,
              completed_jobs_count: 74,
              badge: 'Master Craftsman',
            });
          }
        }
      } catch (err: any) {
        if (err.message && err.message.includes('Role cannot be changed')) {
          throw err;
        }
        console.warn('Supabase phone auth fallback to local session:', err);
      }
    }

    const session: UserSession = {
      userId,
      name: userName,
      phone: phone || (role === 'worker' ? '0301-4458421' : '0333-2211948'),
      role,
      isGuest: false,
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  }

  async loginAsGuest(role: UserRole): Promise<UserSession> {
    let userId = `guest-${role}-${Date.now()}`;
    const guestName = role === 'worker' ? 'مہمان مزدور (Guest Worker)' : 'مہمان مالک (Guest Hirer)';

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data?.user) {
          userId = data.user.id;
          // Store guest profile with locked role
          await supabase.from('profiles').upsert({
            id: userId,
            name: guestName,
            phone: '0300-0000000',
            role,
            is_guest: true,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Supabase guest anonymous login fallback:', err);
      }
    }

    const session: UserSession = {
      userId,
      name: guestName,
      phone: '0300-0000000',
      role,
      isGuest: true,
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  }

  async loginAnonymouslyWithProfile(role: UserRole, name: string, phone: string): Promise<UserSession> {
    let userId = `user-${role}-${Date.now()}`;
    const formattedPhone = phone ? this.formatPhoneE164(phone) : '0300-0000000';

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data?.user) {
          userId = data.user.id;
        }
        await supabase.from('profiles').upsert({
          id: userId,
          name: name || (role === 'worker' ? 'Ahmed Khan' : 'Dr. Bilal Qureshi'),
          phone: formattedPhone,
          role,
          is_guest: false,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase anonymous profile login fallback:', err);
      }
    }

    const session: UserSession = {
      userId,
      name: name || (role === 'worker' ? 'Ahmed Khan' : 'Dr. Bilal Qureshi'),
      phone: formattedPhone,
      role,
      isGuest: false,
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  }

  async signUpWithPhonePin(role: UserRole, name: string, phone: string, pin: string): Promise<UserSession> {
    const formattedPhone = this.formatPhoneE164(phone);
    const email = `${formattedPhone.replace('+', '')}@awamikam.app`;

    if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pin,
        });
        if (error) {
            if (error.message.includes('already registered')) throw new Error('This number is registered. Log in instead.');
            throw error;
        }
        if (data.user) {
            await supabase.from('profiles').insert({
                id: data.user.id,
                name,
                phone: formattedPhone,
                role,
                phone_verified: false,
            });
            if (role === 'worker') {
                await supabase.from('workers').insert({
                    user_id: data.user.id,
                    name,
                    phone: formattedPhone,
                    primary_skill: 'painter',
                    location_area: 'Karachi',
                });
            }
        }
        return { userId: data.user!.id, name, phone: formattedPhone, role, isGuest: false };
    }
    return { userId: 'demo', name, phone: formattedPhone, role, isGuest: false };
  }

  async signInWithPhonePin(role: UserRole, phone: string, pin: string): Promise<UserSession> {
    const formattedPhone = this.formatPhoneE164(phone);
    const email = `${formattedPhone.replace('+', '')}@awamikam.app`;

    if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pin,
        });
        if (error) {
            if (error.message.includes('Invalid login credentials')) throw new Error('Wrong PIN, try again');
            throw error;
        }
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile.role !== role) throw new Error(`Account registered as ${profile.role}.`);
        return { userId: data.user.id, name: profile.name, phone: profile.phone, role: profile.role, isGuest: false };
    }
    return { userId: 'demo', name: 'Demo', phone: formattedPhone, role, isGuest: false };
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut notice:', err);
      }
    }
    localStorage.removeItem(this.sessionKey);
  }

  async deleteAccount(): Promise<void> {
    if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').delete().eq('id', user.id);
            await supabase.auth.signOut();
        }
    }
    localStorage.removeItem(this.sessionKey);
  }

  async switchAccount(role: UserRole): Promise<UserSession> {
    const session: UserSession = {
      userId: role === 'worker' ? 'a0000000-0000-0000-0000-000000000001' : 'a0000000-0000-0000-0000-000000000002',
      name: role === 'worker' ? 'Ahmed Khan' : 'Dr. Bilal Qureshi',
      phone: role === 'worker' ? '0301-4458421' : '0333-2211948',
      role,
      isGuest: false,
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  }

  async loginAsDemoUser(role: UserRole): Promise<UserSession> {
    const demo = role === 'worker' ? DEMO_WORKER : DEMO_HIRER;
    return this.loginWithPhone(demo.phone, demo.otp, role);
  }

  async resetDemoData(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.rpc('reset_demo_data');
        if (error) {
          console.warn('reset_demo_data RPC warning:', error);
        }
      } catch (err) {
        console.warn('reset_demo_data exception:', err);
      }
    }
    localStorage.removeItem(this.workerKey);
    localStorage.removeItem(this.offersKey);
    localStorage.removeItem(this.activeJobKey);
    localStorage.removeItem(this.earningsKey);
    localStorage.removeItem(this.hirerJobsKey);
  }

  async checkDemoSetup(): Promise<{ workerOk: boolean; hirerOk: boolean; seedOk: boolean; details: string }> {
    let workerOk = false;
    let hirerOk = false;
    let seedOk = false;
    let details = 'Checking Supabase and demo accounts...';

    if (isSupabaseConfigured()) {
      try {
        const { data: workerProf } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'worker')
          .maybeSingle();
        workerOk = !!workerProf;

        const { data: hirerProf } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'hirer')
          .maybeSingle();
        hirerOk = !!hirerProf;

        const { data: jobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('is_demo', true);
        seedOk = !!jobs && jobs.length > 0;
        details = `Worker demo user: ${workerOk ? 'OK' : 'Missing'} / Hirer demo user: ${hirerOk ? 'OK' : 'Missing'} / Seed jobs: ${jobs?.length || 0} OK`;
      } catch (err: any) {
        details = `Supabase check error: ${err?.message || err}`;
      }
    } else {
      workerOk = true;
      hirerOk = true;
      seedOk = true;
      details = 'Running in local storage fallback mode (Supabase not configured).';
    }

    if (workerOk && hirerOk && seedOk) {
      console.log('Worker demo OK / Hirer demo OK / Seed OK');
    }

    return { workerOk, hirerOk, seedOk, details };
  }

  // ==========================================
  // REALTIME SUBSCRIPTIONS
  // ==========================================

  /**
   * Workers subscribe to new incoming job offers filtered by worker_id
   */
  subscribeToWorkerOffers(workerId: string, onNewOffer: (offer: JobOffer) => void): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const channelName = `worker-offers-${workerId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offers',
          filter: `worker_id=eq.${workerId}`,
        },
        payload => {
          if (payload.new) {
            const mapped = this.mapDbOfferToJobOffer(payload.new);
            onNewOffer(mapped);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Hirers subscribe to offer status changes (accepted, countered, declined)
   */
  subscribeToJobOffers(jobId: string, onStatusChange: (status: string, offer: any) => void): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const channelName = `job-status-${jobId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'offers',
          filter: `job_id=eq.${jobId}`,
        },
        payload => {
          if (payload.new) {
            onStatusChange(payload.new.status, payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // ==========================================
  // WORKER APIS
  // ==========================================

  async getWorkerProfile(workerId?: string): Promise<WorkerProfile> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('workers').select('*');
        if (workerId) {
          query = query.eq('id', workerId);
        } else {
          const session = this.getCurrentSession();
          if (session?.userId && !session.isGuest) {
            query = query.eq('user_id', session.userId);
          } else {
            query = query.eq('is_demo', true).limit(1);
          }
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          const mapped = this.mapDbWorkerToProfile(data);
          localStorage.setItem(this.workerKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch worker profile fallback:', err);
      }
    }

    // Local / fallback store
    const raw = localStorage.getItem(this.workerKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    localStorage.setItem(this.workerKey, JSON.stringify(FALLBACK_WORKER_PROFILE));
    return FALLBACK_WORKER_PROFILE;
  }

  async updateWorkerProfile(updates: Partial<WorkerProfile>): Promise<WorkerProfile> {
    const current = await this.getWorkerProfile();
    const updated = { ...current, ...updates };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('workers')
          .update({
            name: updated.name,
            primary_skill: updated.primary_skill,
            skills: updated.skills,
            location_area: updated.location_area,
            is_online: updated.is_online,
            expected_daily_rate_pkr: updated.expected_daily_rate_pkr,
            availability: updated.availability,
            latitude: updated.latitude,
            longitude: updated.longitude,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updated.id);
      } catch (err) {
        console.warn('Supabase update worker profile fallback:', err);
      }
    }

    localStorage.setItem(this.workerKey, JSON.stringify(updated));
    return updated;
  }

  async updateWorkerAvailability(isOnline: boolean, lat?: number, lng?: number): Promise<boolean> {
    const current = await this.getWorkerProfile();
    const updates: Partial<WorkerProfile> = { is_online: isOnline };
    if (lat !== undefined) updates.latitude = lat;
    if (lng !== undefined) updates.longitude = lng;

    await this.updateWorkerProfile(updates);
    return isOnline;
  }

  async getIncomingJobOffers(): Promise<JobOffer[]> {
    if (isSupabaseConfigured()) {
      try {
        const worker = await this.getWorkerProfile();
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .or(`worker_id.eq.${worker.id},is_demo.eq.true`)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(this.mapDbOfferToJobOffer);
          localStorage.setItem(this.offersKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch offers fallback:', err);
      }
    }

    const raw = localStorage.getItem(this.offersKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    localStorage.setItem(this.offersKey, JSON.stringify(INITIAL_JOB_OFFERS));
    return INITIAL_JOB_OFFERS;
  }

  async acceptJobOffer(offerId: string): Promise<ActiveJob> {
    const offers = await this.getIncomingJobOffers();
    const offer = offers.find(o => o.id === offerId) || offers[0];
    let workerPhoneUnmasked = '0301-4458421';
    let hirerPhoneUnmasked = '0333-2211948';

    if (isSupabaseConfigured()) {
      try {
        // 1. Mark offer accepted
        await supabase
          .from('offers')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', offerId);

        // 2. Mark job matched
        await supabase
          .from('jobs')
          .update({ status: 'matched', updated_at: new Date().toISOString() })
          .eq('id', offer.job_id);

        // 3. Reveal unmasked phone numbers using RPC get_job_contact
        const { data: contactData } = await supabase
          .rpc('get_job_contact', { p_job_id: offer.job_id });

        if (contactData && contactData.length > 0) {
          const contact = contactData[0];
          if (contact.worker_phone_revealed) workerPhoneUnmasked = contact.worker_phone_revealed;
          if (contact.hirer_phone_revealed) hirerPhoneUnmasked = contact.hirer_phone_revealed;
        }
      } catch (err) {
        console.warn('Supabase accept offer fallback:', err);
      }
    }

    // Update local state
    const updatedOffers = offers.map(o => (o.id === offerId ? { ...o, status: 'accepted' as const } : o));
    localStorage.setItem(this.offersKey, JSON.stringify(updatedOffers));

    const activeJob: ActiveJob = {
      id: `act-${Date.now()}`,
      jobId: offer.job_id,
      jobTitle: offer.job_title,
      skill: offer.skill,
      area: offer.area,
      hirerName: 'Dr. Bilal Qureshi',
      hirerPhone: hirerPhoneUnmasked,
      workerName: 'Ahmed Khan',
      workerPhone: workerPhoneUnmasked,
      agreedPricePkr: offer.counter_price_pkr || offer.rate_pkr,
      status: 'heading_to_site',
      workerLat: 24.9080,
      workerLng: 67.0435,
      jobLat: 24.9207,
      jobLng: 67.0928,
      etaMinutes: 18,
      createdAt: 'Just now',
    };

    localStorage.setItem(this.activeJobKey, JSON.stringify(activeJob));
    return activeJob;
  }

  async declineJobOffer(offerId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('offers')
          .update({ status: 'declined', updated_at: new Date().toISOString() })
          .eq('id', offerId);
      } catch (err) {
        console.warn('Supabase decline offer fallback:', err);
      }
    }

    const offers = await this.getIncomingJobOffers();
    const updatedOffers = offers.map(o => (o.id === offerId ? { ...o, status: 'declined' as const } : o));
    localStorage.setItem(this.offersKey, JSON.stringify(updatedOffers));
    return true;
  }

  async counterJobOffer(offerId: string, counterPkr: number): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('offers')
          .update({
            status: 'countered',
            counter_price_pkr: counterPkr,
            updated_at: new Date().toISOString(),
          })
          .eq('id', offerId);
      } catch (err) {
        console.warn('Supabase counter offer fallback:', err);
      }
    }

    const offers = await this.getIncomingJobOffers();
    const updatedOffers = offers.map(o =>
      o.id === offerId ? { ...o, status: 'countered' as const, counter_price_pkr: counterPkr } : o
    );
    localStorage.setItem(this.offersKey, JSON.stringify(updatedOffers));
    return true;
  }

  async getActiveJob(): Promise<ActiveJob | null> {
    const raw = localStorage.getItem(this.activeJobKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async updateActiveJobStatus(status: 'heading_to_site' | 'arrived' | 'completed'): Promise<ActiveJob | null> {
    const current = await this.getActiveJob();
    if (!current) return null;
    const updated = { ...current, status };

    if (isSupabaseConfigured()) {
      try {
        const dbStatus = status === 'completed' ? 'completed' : 'in_progress';
        await supabase
          .from('jobs')
          .update({ status: dbStatus, updated_at: new Date().toISOString() })
          .eq('id', current.jobId);
      } catch (err) {
        console.warn('Supabase update job status fallback:', err);
      }
    }

    if (status === 'completed') {
      localStorage.removeItem(this.activeJobKey);
      await this.recordCompletedJob(current);
    } else {
      localStorage.setItem(this.activeJobKey, JSON.stringify(updated));
    }
    return updated;
  }

  private async recordCompletedJob(job: ActiveJob): Promise<void> {
    const earnings = await this.getWorkerEarnings();
    earnings.todayPkr += job.agreedPricePkr;
    earnings.thisWeekPkr += job.agreedPricePkr;
    earnings.totalPkr += job.agreedPricePkr;
    earnings.jobsCompleted += 1;
    earnings.completedList.unshift({
      id: `hist-${Date.now()}`,
      title: job.jobTitle,
      area: job.area,
      date: 'Today',
      earningsPkr: job.agreedPricePkr,
      ratingStars: 5,
      hirerName: job.hirerName,
      skill: job.skill,
    });
    localStorage.setItem(this.earningsKey, JSON.stringify(earnings));
  }

  async getWorkerEarnings(): Promise<WorkerEarnings> {
    const raw = localStorage.getItem(this.earningsKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    const initial: WorkerEarnings = {
      todayPkr: 3800,
      thisWeekPkr: 19400,
      totalPkr: 284000,
      jobsCompleted: 74,
      completedList: [
        {
          id: 'hist-1',
          title: 'Full Wall Painting & Distemper',
          area: 'Gulshan-e-Iqbal',
          date: 'Yesterday',
          earningsPkr: 4000,
          ratingStars: 5,
          hirerName: 'Tariq Sahab',
          skill: 'painter',
        },
        {
          id: 'hist-2',
          title: 'Exterior Gate Enamel Polish',
          area: 'Nazimabad',
          date: '14 Oct',
          earningsPkr: 3500,
          ratingStars: 5,
          hirerName: 'Salman Beg',
          skill: 'painter',
        },
        {
          id: 'hist-3',
          title: '3 Rooms Distemper Paint',
          area: 'Federal B Area',
          date: '12 Oct',
          earningsPkr: 4500,
          ratingStars: 4.8,
          hirerName: 'Haji Aslam',
          skill: 'painter',
        },
      ],
    };
    localStorage.setItem(this.earningsKey, JSON.stringify(initial));
    return initial;
  }

  // ==========================================
  // HIRER APIS
  // ==========================================

  calculateFairPrice(skill: SkillType, amount: number, area: string): FairPriceAssessment {
    const def = SKILL_DEFINITIONS[skill] || SKILL_DEFINITIONS.painter;
    let factor = 1.0;
    if (amount > 2) factor += (amount - 2) * 0.35;
    if (area === 'DHA' || area === 'Clifton') factor *= 1.1;

    const minPkr = Math.round((def.baseMinRate * factor) / 100) * 100;
    const maxPkr = Math.round((def.baseMaxRate * factor) / 100) * 100;
    const recommendedPkr = Math.round((def.baseAvgRate * factor) / 100) * 100;

    return {
      minPkr,
      maxPkr,
      recommendedPkr,
      isFair: true,
      reason: `Fair market benchmark for 1 ${def.labelEn} (${amount} ${def.unit}) in ${area}`,
      warningVoiceUr: `مارکیٹ ریٹ ${minPkr.toLocaleString()} سے ${maxPkr.toLocaleString()} روپے ہے۔`,
    };
  }

  async getMatchingWorkers(request: JobBookingRequest): Promise<MatchedWorkerOption[]> {
    const def = SKILL_DEFINITIONS[request.skill] || SKILL_DEFINITIONS.painter;
    const reqCoords = AREA_COORDINATES[request.area] || { latitude: 24.9207, longitude: 67.0928 };

    // Query candidates: try Supabase first
    let candidates: WorkerProfile[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .eq('is_online', true)
          .limit(10);

        if (!error && data && data.length > 0) {
          candidates = data.map(this.mapDbWorkerToProfile);
        }
      } catch (err) {
        console.warn('Supabase match workers fallback:', err);
      }
    }

    if (candidates.length === 0) {
      candidates = SEEDED_WORKERS.filter(w => w.primary_skill === request.skill || w.is_online);
    }

    // Score and rank candidates using hybrid scoring
    const dummyJob: JobListing = {
      id: 'job-req',
      title: `${request.sizeAmount} ${request.sizeUnit} ${def.labelEn}`,
      job_type: def.labelEn,
      skill_needed: request.skill,
      workers_needed: 1,
      area: request.area,
      city: 'Karachi',
      latitude: reqCoords.latitude,
      longitude: reqCoords.longitude,
      date: request.dateOption === 'pick_date' ? 'this_week' : request.dateOption,
      job_size: `${request.sizeAmount} ${request.sizeUnit}`,
      urgency: 'normal',
      special_requirements: request.note || '',
      offered_rate_pkr: request.offeredPricePkr,
      hirer_name: 'Dr. Bilal Qureshi',
      hirer_phone: '0333-2211948',
      status: 'open',
      created_at: 'Just now',
    };

    const scored = candidates.map(worker => {
      const breakdown = scoreWorkerForJob(worker, dummyJob);
      const distanceKm = calculateHaversineDistance(
        worker.latitude,
        worker.longitude,
        reqCoords.latitude,
        reqCoords.longitude
      );
      const etaMinutes = Math.max(10, Math.round(distanceKm * 4));

      return {
        worker,
        matchScore: breakdown.total,
        distanceKm,
        etaMinutes,
        offeredPricePkr: request.offeredPricePkr,
        whyMatched: `Top rated ${def.labelEn} in ${worker.location_area} with ${worker.experience_years} years verified experience.`,
        scoreBreakdown: breakdown,
      } as MatchedWorkerOption;
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, 3);
  }

  async hireWorker(request: JobBookingRequest, workerOption: MatchedWorkerOption): Promise<ActiveJob> {
    const agreedPkr = workerOption.hasCountered ? workerOption.counterPricePkr! : request.offeredPricePkr;
    const reqCoords = AREA_COORDINATES[request.area] || { latitude: 24.9207, longitude: 67.0928 };
    const session = this.getCurrentSession();
    let jobId = `job-${Date.now()}`;
    let offerId = `offer-${Date.now()}`;
    let workerPhone = workerOption.worker.phoneFull || '0301-4458421';
    let hirerPhone = session?.phone || '0333-2211948';

    if (isSupabaseConfigured()) {
      try {
        // 1. Insert Job into jobs table
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .insert({
            hirer_id: session?.userId || 'a0000000-0000-0000-0000-000000000002',
            title: `${request.sizeAmount} ${request.sizeUnit} ${SKILL_DEFINITIONS[request.skill]?.labelEn || ''}`,
            job_type: request.skill,
            skill_needed: request.skill,
            workers_needed: 1,
            area: request.area,
            city: 'Karachi',
            latitude: reqCoords.latitude,
            longitude: reqCoords.longitude,
            job_size: `${request.sizeAmount} ${request.sizeUnit}`,
            urgency: 'normal',
            special_requirements: request.note || 'Direct instant hire',
            offered_rate_pkr: agreedPkr,
            status: 'matched',
            assigned_worker_id: workerOption.worker.id,
            voice_summary_ur: `${workerOption.worker.name} بھائی کے لیے کام۔ مزدوری ${agreedPkr} روپے`,
          })
          .select()
          .single();

        if (!jobError && jobData) {
          jobId = jobData.id;

          // 2. Insert Offer into offers table (accepted state)
          const { data: offerData } = await supabase
            .from('offers')
            .insert({
              job_id: jobId,
              worker_id: workerOption.worker.id,
              job_title: jobData.title,
              skill: request.skill,
              area: request.area,
              city: 'Karachi',
              rate_pkr: agreedPkr,
              counter_price_pkr: workerOption.hasCountered ? workerOption.counterPricePkr : null,
              distance_km: workerOption.distanceKm,
              urgency: 'normal',
              voice_message_ur: `${workerOption.worker.name} بھائی، آپ کو ${request.area} میں ${jobData.title} کی نوکری ملی ہے۔ مزدوری ${agreedPkr.toLocaleString()} روپے۔`,
              status: 'accepted',
            })
            .select()
            .single();

          if (offerData) offerId = offerData.id;

          // 3. Unmask contact info via RPC get_job_contact
          const { data: contactData } = await supabase.rpc('get_job_contact', { p_job_id: jobId });
          if (contactData && contactData.length > 0) {
            const c = contactData[0];
            if (c.worker_phone_revealed) workerPhone = c.worker_phone_revealed;
            if (c.hirer_phone_revealed) hirerPhone = c.hirer_phone_revealed;
          }
        }
      } catch (err) {
        console.warn('Supabase hire worker fallback:', err);
      }
    }

    const activeJob: ActiveJob = {
      id: `act-${Date.now()}`,
      jobId,
      jobTitle: `${request.sizeAmount} ${request.sizeUnit} ${SKILL_DEFINITIONS[request.skill]?.labelEn || ''}`,
      skill: request.skill,
      area: request.area,
      hirerName: session?.name || 'Dr. Bilal Qureshi',
      hirerPhone,
      workerName: workerOption.worker.name,
      workerPhone,
      agreedPricePkr: agreedPkr,
      status: 'heading_to_site',
      workerLat: workerOption.worker.latitude,
      workerLng: workerOption.worker.longitude,
      jobLat: reqCoords.latitude,
      jobLng: reqCoords.longitude,
      etaMinutes: workerOption.etaMinutes,
      createdAt: 'Just now',
    };

    localStorage.setItem(this.activeJobKey, JSON.stringify(activeJob));

    // Also push offer to worker's local queue for split-screen demo
    const offers = await this.getIncomingJobOffers();
    const newOffer: JobOffer = {
      id: offerId,
      job_id: jobId,
      worker_id: workerOption.worker.id,
      job_title: activeJob.jobTitle,
      skill: activeJob.skill,
      area: activeJob.area,
      city: 'Karachi',
      rate_pkr: agreedPkr,
      date: 'Today',
      distance_km: workerOption.distanceKm,
      urgency: 'normal',
      voice_message_ur: `${workerOption.worker.name} بھائی، آپ کو ${activeJob.area} میں ${activeJob.jobTitle} کی نوکری ملی ہے۔ مزدوری ${agreedPkr.toLocaleString()} روپے۔`,
      is_below_market: false,
      status: 'accepted',
      created_at: 'Just now',
    };
    localStorage.setItem(this.offersKey, JSON.stringify([newOffer, ...offers]));

    return activeJob;
  }

  async getHirerJobs(): Promise<JobListing[]> {
    if (isSupabaseConfigured()) {
      try {
        const session = this.getCurrentSession();
        let query = supabase.from('jobs').select('*');
        if (session?.userId && !session.isGuest) {
          query = query.or(`hirer_id.eq.${session.userId},is_demo.eq.true`);
        } else {
          query = query.eq('is_demo', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = data.map(this.mapDbJobToJobListing);
          localStorage.setItem(this.hirerJobsKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch hirer jobs fallback:', err);
      }
    }

    const raw = localStorage.getItem(this.hirerJobsKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    const initial = SEEDED_JOBS.slice(0, 3);
    localStorage.setItem(this.hirerJobsKey, JSON.stringify(initial));
    return initial;
  }

  // ==========================================
  // STORAGE: VOICE NOTES BUCKET
  // ==========================================

  async uploadVoiceNote(userId: string, audioBlob: Blob, filename?: string): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const name = filename || `${Date.now()}.webm`;
      const filePath = `${userId}/${name}`;

      const { data, error } = await supabase.storage
        .from('voice-notes')
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        return null;
      }
      return data?.path || null;
    } catch (err) {
      console.warn('Supabase upload voice note fallback:', err);
      return null;
    }
  }

  // ==========================================
  // VOICE SIMULATION HELPER & IMPACT METRICS
  // ==========================================

  async simulateVoiceOnboarding(transcript: string): Promise<Partial<WorkerProfile>> {
    try {
      const res = await fetch('/api/gemini/worker-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textPrompt: transcript }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.name || 'Ahmed Khan',
          primary_skill: (data.primary_skill || 'painter') as SkillType,
          location_area: data.location_area || 'Liaquatabad',
          expected_daily_rate_pkr: data.expected_daily_rate_pkr || 3800,
          detected_language: data.detected_language || 'Urdu',
          transcript_original: transcript,
        };
      }
    } catch {}

    return {
      name: 'Ahmed Khan',
      primary_skill: 'painter',
      location_area: 'Liaquatabad',
      expected_daily_rate_pkr: 3800,
      detected_language: 'Urdu',
      transcript_original: transcript,
    };
  }

  async getImpactStats(): Promise<ImpactMetrics> {
    return {
      workersRegistered: 1840,
      jobsMatched: 6420,
      totalPkrEarned: 24700000,
      wageUpliftPercent: 28.4,
      unfairJobsPrevented: 312,
      languageDistribution: {
        Urdu: 42,
        Punjabi: 24,
        Pashto: 18,
        Sindhi: 11,
        Saraiki: 5,
      },
    };
  }

  // ==========================================
  // DATABASE MAPPER HELPERS
  // ==========================================

  private mapDbWorkerToProfile(row: any): WorkerProfile {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone ? `${row.phone.slice(0, 4)}-***${row.phone.slice(-4)}` : '0301-***8421',
      phoneFull: row.phone || '0301-4458421',
      detected_language: row.detected_language || 'Urdu',
      language_code: row.language_code || 'ur',
      primary_skill: (row.primary_skill || 'painter') as SkillType,
      skills: Array.isArray(row.skills) ? row.skills : ['Craftsman'],
      location_area: row.location_area || 'Karachi',
      city: row.city || 'Karachi',
      latitude: Number(row.latitude) || 24.9080,
      longitude: Number(row.longitude) || 67.0435,
      availability: row.availability || 'today',
      is_online: row.is_online ?? true,
      experience_years: row.experience_years || 5,
      expected_daily_rate_pkr: row.expected_daily_rate_pkr || 3800,
      reliability_score: Number(row.reliability_score) || 4.9,
      completed_jobs_count: row.completed_jobs_count || 0,
      badge: row.badge || 'Verified Chowk',
      voice_intro_text: row.voice_intro_text || '',
      avatar_color: row.avatar_color || '#0B6B3A',
      confidence: Number(row.confidence) || 0.95,
    };
  }

  private mapDbOfferToJobOffer(row: any): JobOffer {
    return {
      id: row.id,
      job_id: row.job_id,
      worker_id: row.worker_id,
      job_title: row.job_title,
      skill: row.skill as SkillType,
      area: row.area,
      city: row.city || 'Karachi',
      rate_pkr: row.rate_pkr,
      counter_price_pkr: row.counter_price_pkr || undefined,
      date: 'Today',
      distance_km: Number(row.distance_km) || 3.0,
      urgency: (row.urgency || 'normal') as any,
      voice_message_ur: row.voice_message_ur,
      voice_message_en: row.voice_message_en || undefined,
      is_below_market: row.is_below_market || false,
      status: (row.status || 'pending') as any,
      created_at: 'Just now',
    };
  }

  private mapDbJobToJobListing(row: any): JobListing {
    return {
      id: row.id,
      title: row.title,
      job_type: row.job_type,
      skill_needed: row.skill_needed as SkillType,
      workers_needed: row.workers_needed || 1,
      area: row.area,
      city: row.city || 'Karachi',
      latitude: Number(row.latitude) || 24.9207,
      longitude: Number(row.longitude) || 67.0928,
      date: row.date_option === 'pick_date' ? 'this_week' : (row.date_option || 'today'),
      job_size: row.job_size || 'standard',
      urgency: (row.urgency || 'normal') as any,
      special_requirements: row.special_requirements || '',
      offered_rate_pkr: row.offered_rate_pkr,
      hirer_name: row.hirer_name || 'Dr. Bilal Qureshi',
      hirer_phone: row.hirer_phone || '0333-2211948',
      status: (row.status || 'open') as any,
      created_at: 'Today',
    };
  }

  // ==========================================
  // VOICE ASSISTANT (SUPABASE EDGE FUNCTION)
  // ==========================================

  async invokeVoiceAssistant(payload: { audio_base64?: string; transcript_text?: string; language?: string }): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-assistant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Voice assistant Edge Function fallback:', err);
      }
    }

    // Fallback simulation response if offline or unconfigured
    const text = payload.transcript_text || 'کام';
    if (text.includes('آج') || text.includes('job')) {
      return {
        intent: 'my_jobs_today',
        requires_confirmation: false,
        reply_ur: 'آپ کے پاس آج 1 فعال نوکری گلشن اقبال میں ہے۔',
        reply_en: 'You have 1 active job today in Gulshan-e-Iqbal.',
        confidence: 0.95,
      };
    } else if (text.includes('آمدنی') || text.includes('earnings')) {
      return {
        intent: 'earnings_today',
        requires_confirmation: false,
        reply_ur: 'آج کی آپ کی کل آمدنی 4,200 روپے ہے۔',
        reply_en: 'Your total earnings today are 4,200 PKR.',
        confidence: 0.95,
      };
    } else {
      return {
        intent: 'unknown',
        requires_confirmation: false,
        reply_ur: 'معذرت، میں سمجھا نہیں۔ براہ کرم دوبارہ بولیں۔',
        reply_en: 'Sorry, I did not understand. Please speak again.',
        confidence: 0.8,
      };
    }
  }
}

export const api = new ApiService();

