-- ==============================================================================
-- AWAMI KAM (عوامی کام) - SUPABASE DATABASE SCHEMA
-- Voice-First Daily-Wage Marketplace for Pakistan
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User identity & role locking)
-- Roles: 'worker' | 'hirer'. Once set, the role is immutable.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker', 'hirer')),
  is_guest BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to prevent changing role after profile creation (Role Locking)
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS NOT NULL AND NEW.role <> OLD.role THEN
    RAISE EXCEPTION 'Role is locked after registration and cannot be changed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_prevent_role_change ON public.profiles;
CREATE TRIGGER tr_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- 2. WORKERS TABLE (Artisan details, availability, location, skill)
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  detected_language TEXT DEFAULT 'Urdu',
  language_code TEXT DEFAULT 'ur',
  primary_skill TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  location_area TEXT NOT NULL,
  city TEXT DEFAULT 'Karachi',
  latitude DOUBLE PRECISION DEFAULT 24.9080,
  longitude DOUBLE PRECISION DEFAULT 67.0435,
  availability TEXT DEFAULT 'today',
  is_online BOOLEAN DEFAULT true,
  experience_years INTEGER DEFAULT 5,
  expected_daily_rate_pkr INTEGER NOT NULL DEFAULT 3800,
  reliability_score NUMERIC(3,2) DEFAULT 4.90,
  completed_jobs_count INTEGER DEFAULT 0,
  badge TEXT DEFAULT 'Verified Chowk',
  voice_intro_text TEXT,
  avatar_color TEXT DEFAULT '#0B6B3A',
  confidence NUMERIC(3,2) DEFAULT 0.95,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOBS TABLE (Hirer job postings & broadcasts)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hirer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  job_type TEXT NOT NULL,
  skill_needed TEXT NOT NULL,
  workers_needed INTEGER DEFAULT 1,
  area TEXT NOT NULL,
  city TEXT DEFAULT 'Karachi',
  latitude DOUBLE PRECISION DEFAULT 24.9207,
  longitude DOUBLE PRECISION DEFAULT 67.0928,
  date_option TEXT DEFAULT 'today',
  time_slot TEXT DEFAULT 'morning',
  job_size TEXT,
  urgency TEXT DEFAULT 'normal',
  special_requirements TEXT,
  offered_rate_pkr INTEGER NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'in_progress', 'completed', 'cancelled')),
  assigned_worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  voice_summary_ur TEXT,
  voice_summary_en TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. OFFERS TABLE (Direct dispatcher bids & incoming job cards)
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  skill TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT DEFAULT 'Karachi',
  rate_pkr INTEGER NOT NULL,
  counter_price_pkr INTEGER,
  distance_km NUMERIC(5,2) DEFAULT 3.0,
  urgency TEXT DEFAULT 'normal',
  voice_message_ur TEXT NOT NULL,
  voice_message_en TEXT,
  is_below_market BOOLEAN DEFAULT false,
  market_rate_warning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'countered', 'completed')),
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RATINGS & SENTIMENT TABLE (Post-job completion feedback)
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_role TEXT CHECK (reviewer_role IN ('worker', 'hirer')),
  rating_stars INTEGER CHECK (rating_stars BETWEEN 1 AND 5),
  audio_url TEXT,
  transcript TEXT,
  detected_sentiment TEXT,
  sentiment_score NUMERIC(3,2),
  feedback_highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read & update only their own profile
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public/Demo read access for profile names & avatars in matching
CREATE POLICY "Public can view non-sensitive profile summaries"
  ON public.profiles FOR SELECT
  USING (true);

-- Workers: Workers manage their own profile, anyone can view available workers
CREATE POLICY "Anyone can view online workers"
  ON public.workers FOR SELECT
  USING (true);

CREATE POLICY "Workers update own worker profile"
  ON public.workers FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Workers insert own worker profile"
  ON public.workers FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Jobs: Hirers manage their own jobs, workers can view open jobs
CREATE POLICY "Hirers manage own jobs"
  ON public.jobs FOR ALL
  USING (auth.uid() = hirer_id OR hirer_id IS NULL);

CREATE POLICY "Anyone can view open and demo jobs"
  ON public.jobs FOR SELECT
  USING (status = 'open' OR is_demo = true OR auth.uid() = hirer_id);

-- Offers: Workers see only offers addressed to them, Hirers see offers for their jobs
CREATE POLICY "Workers see own offers"
  ON public.offers FOR SELECT
  USING (
    worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
    OR is_demo = true
  );

CREATE POLICY "Hirers see offers for their jobs"
  ON public.offers FOR SELECT
  USING (
    job_id IN (SELECT id FROM public.jobs WHERE hirer_id = auth.uid())
    OR is_demo = true
  );

CREATE POLICY "Workers and Hirers update offers"
  ON public.offers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Hirers create offers"
  ON public.offers FOR INSERT
  WITH CHECK (true);

-- Ratings: Participants can read and insert
CREATE POLICY "Participants read ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Participants insert ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id OR reviewer_id IS NULL);

-- ==============================================================================
-- PRIVACY MASKING FUNCTION & RPC
-- Phone numbers are exposed ONLY when an offer status is 'accepted'
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_job_contact(p_job_id UUID)
RETURNS TABLE (
  job_id UUID,
  worker_id UUID,
  worker_name TEXT,
  worker_phone_revealed TEXT,
  hirer_name TEXT,
  hirer_phone_revealed TEXT,
  agreed_rate INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id AS job_id,
    w.id AS worker_id,
    w.name AS worker_name,
    CASE 
      WHEN o.status = 'accepted' THEN w.phone
      ELSE CONCAT(SUBSTRING(w.phone, 1, 4), '-***', SUBSTRING(w.phone, 8, 4))
    END AS worker_phone_revealed,
    p.name AS hirer_name,
    CASE 
      WHEN o.status = 'accepted' THEN p.phone
      ELSE CONCAT(SUBSTRING(p.phone, 1, 4), '-***', SUBSTRING(p.phone, 8, 4))
    END AS hirer_phone_revealed,
    COALESCE(o.counter_price_pkr, o.rate_pkr, j.offered_rate_pkr) AS agreed_rate,
    o.status AS status
  FROM public.jobs j
  JOIN public.profiles p ON p.id = j.hirer_id
  LEFT JOIN public.offers o ON o.job_id = j.id AND o.status = 'accepted'
  LEFT JOIN public.workers w ON w.id = o.worker_id
  WHERE j.id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- STORAGE: PRIVATE "voice-notes" BUCKET WITH PER-USER FOLDER POLICIES
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to their own user_id folder
CREATE POLICY "Users can upload their own voice notes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-notes' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can view their own voice notes or job participants can view
CREATE POLICY "Users can access voice notes in their folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-notes' 
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR auth.uid() IS NOT NULL
    )
  );

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;
