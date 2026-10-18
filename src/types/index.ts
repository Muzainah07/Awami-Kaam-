export type LanguageCode = 'ur' | 'pa' | 'ps' | 'sd' | 'skr' | 'en';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
  dir: 'rtl' | 'ltr';
}

export type UserRole = 'worker' | 'hirer';

export interface UserSession {
  userId: string;
  name: string;
  phone: string;
  role: UserRole;
  isGuest?: boolean;
  avatar?: string;
  token?: string;
  phone_verified?: boolean;
}

export type SkillType = 
  | 'painter' 
  | 'plumber' 
  | 'electrician' 
  | 'carpenter' 
  | 'mason' 
  | 'helper' 
  | 'ac_technician' 
  | 'cleaner'
  | 'laborer'
  | 'tile_worker'
  | 'welder';

export interface SkillDefinition {
  id: SkillType;
  labelEn: string;
  labelUr: string;
  icon: string;
  baseMinRate: number;
  baseMaxRate: number;
  baseAvgRate: number;
  unit: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  phoneFull?: string;
  detected_language: string;
  language_code: LanguageCode;
  primary_skill: SkillType;
  skills: string[];
  location_area: string;
  city: string;
  latitude: number;
  longitude: number;
  availability: 'today' | 'tomorrow' | 'this_week';
  is_online?: boolean;
  experience_years: number;
  expected_daily_rate_pkr: number;
  reliability_score: number; // 0-5 stars
  completed_jobs_count: number;
  badge: 'Top Rated' | 'Verified Chowk' | 'Rising Star' | 'Master Craftsman';
  transcript_original?: string;
  transcript_english?: string;
  voice_intro_text?: string;
  avatar_color: string;
  confidence: number;
  phone_verified?: boolean;
}

export interface JobBookingRequest {
  skill: SkillType;
  area: string;
  city: string;
  dateOption: 'today' | 'tomorrow' | 'pick_date';
  specificDate?: string;
  timeSlot: 'morning' | 'afternoon' | 'anytime';
  sizeAmount: number;
  sizeUnit: string;
  workersCount: number;
  note?: string;
  offeredPricePkr: number;
}

export interface JobListing {
  id: string;
  title: string;
  job_type: string;
  skill_needed: SkillType;
  workers_needed: number;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  date: 'today' | 'tomorrow' | 'this_week';
  job_size: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  special_requirements: string;
  offered_rate_pkr: number;
  hirer_name: string;
  hirer_phone: string;
  created_at: string;
  status: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  assigned_worker_id?: string;
  voice_summary_ur?: string;
  voice_summary_en?: string;
  scam_risk?: {
    is_suspicious: boolean;
    severity: 'safe' | 'warning' | 'high';
    reasons: string[];
  };
}

export interface JobOffer {
  id: string;
  job_id: string;
  worker_id: string;
  job_title: string;
  skill: SkillType;
  area: string;
  city: string;
  rate_pkr: number;
  counter_price_pkr?: number;
  date: string;
  distance_km: number;
  urgency: 'normal' | 'urgent' | 'emergency';
  voice_message_ur: string;
  voice_message_en?: string;
  is_below_market: boolean;
  market_rate_warning?: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered' | 'completed';
  created_at: string;
}

export interface MatchScoreBreakdown {
  skillMatch: number; // 0-30
  proximity: number; // 0-25
  availability: number; // 0-15
  reliability: number; // 0-15
  semantic: number; // 0-15
  total: number; // 0-100
  distance_km: number;
  explanation: string;
}

export interface WorkerMatch {
  worker: WorkerProfile;
  score: MatchScoreBreakdown;
}

export interface WageEstimate {
  skill: string;
  city: string;
  area: string;
  min_rate_pkr: number;
  max_rate_pkr: number;
  recommended_pkr: number;
  market_average_pkr: number;
  is_fair: boolean;
  difference_percentage: number;
  reason: string;
  worker_voice_warning_ur: string;
  worker_voice_warning_en: string;
}

export interface MatchedWorkerOption {
  worker: WorkerProfile;
  matchScore: number;
  distanceKm: number;
  etaMinutes: number;
  offeredPricePkr: number;
  hasCountered?: boolean;
  counterPricePkr?: number;
  whyMatched: string;
  scoreBreakdown: {
    skillMatch: number;
    proximity: number;
    availability: number;
    reliability: number;
    total: number;
  };
}

export interface ActiveJob {
  id: string;
  jobId: string;
  jobTitle: string;
  skill: SkillType;
  area: string;
  hirerName: string;
  hirerPhone: string;
  workerName: string;
  workerPhone: string;
  agreedPricePkr: number;
  status: 'heading_to_site' | 'arrived' | 'completed';
  workerLat: number;
  workerLng: number;
  jobLat: number;
  jobLng: number;
  etaMinutes: number;
  createdAt: string;
}

export interface JobHistoryItem {
  id: string;
  title: string;
  area: string;
  date: string;
  earningsPkr: number;
  ratingStars: number;
  hirerName: string;
  skill: SkillType;
}

export interface WorkerEarnings {
  todayPkr: number;
  thisWeekPkr: number;
  totalPkr: number;
  jobsCompleted: number;
  completedList: JobHistoryItem[];
}

export interface FairPriceAssessment {
  minPkr: number;
  maxPkr: number;
  recommendedPkr: number;
  isFair: boolean;
  reason: string;
  warningVoiceUr: string;
}

export interface ImpactMetrics {
  workersRegistered: number;
  jobsMatched: number;
  totalPkrEarned: number;
  wageUpliftPercent: number;
  unfairJobsPrevented: number;
  languageDistribution: Record<string, number>;
}

export interface JobReview {
  id: string;
  job_id: string;
  worker_id: string;
  hirer_name: string;
  reviewer_role: 'worker' | 'hirer';
  audio_transcript: string;
  detected_sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number; // -1 to 1
  rating_stars: number; // 1-5
  feedback_highlights: string[];
  created_at: string;
}

export interface AreaCoordinates {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}
