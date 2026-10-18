import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type FunnelEvent = 'signup' | 'onboarding_done' | 'first_offer' | 'first_accepted' | 'first_completed';

export async function trackAnalyticsEvent(eventName: FunnelEvent, metadata: Record<string, any> = {}): Promise<void> {
  try {
    if (!isSupabaseConfigured()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_name: eventName,
      metadata
    });
  } catch (err) {
    console.warn('Analytics tracking error:', err);
  }
}
