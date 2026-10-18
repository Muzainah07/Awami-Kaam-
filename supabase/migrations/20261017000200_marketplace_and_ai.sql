-- ==============================================================================
-- MIGRATION: Marketplace Logic, pgvector, Wage Benchmarks, AI Usage, RLS
-- ==============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. WAGE BENCHMARKS TABLE (Source of truth for fair wage)
CREATE TABLE IF NOT EXISTS public.wage_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Karachi',
  min_pkr INTEGER NOT NULL,
  max_pkr INTEGER NOT NULL,
  avg_pkr INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'day',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skill, city)
);

-- Seed Karachi wage benchmarks
INSERT INTO public.wage_benchmarks (skill, city, min_pkr, max_pkr, avg_pkr, unit) VALUES
  ('painter', 'Karachi', 3000, 4500, 3800, 'rooms'),
  ('plumber', 'Karachi', 3000, 5000, 4000, 'bathrooms'),
  ('electrician', 'Karachi', 3500, 5500, 4300, 'points'),
  ('carpenter', 'Karachi', 3500, 5500, 4400, 'items'),
  ('mason', 'Karachi', 3500, 5200, 4300, 'sq ft'),
  ('helper', 'Karachi', 1800, 2600, 2200, 'hours'),
  ('ac_technician', 'Karachi', 3500, 5500, 4500, 'units'),
  ('cleaner', 'Karachi', 2000, 3200, 2500, 'hours'),
  ('laborer', 'Karachi', 1800, 2600, 2200, 'hours'),
  ('tile_worker', 'Karachi', 3800, 5500, 4600, 'sq ft'),
  ('welder', 'Karachi', 3500, 5200, 4100, 'items')
ON CONFLICT (skill, city) DO UPDATE SET
  min_pkr = EXCLUDED.min_pkr,
  max_pkr = EXCLUDED.max_pkr,
  avg_pkr = EXCLUDED.avg_pkr;

-- 2. AI USAGE & BUDGET LOGGING TABLE
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  function_name TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB RATE LIMITS TABLE (5 posts per hirer per hour)
CREATE TABLE IF NOT EXISTS public.job_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hirer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKER PRESENCE TABLE
CREATE TABLE IF NOT EXISTS public.worker_presence (
  worker_id UUID PRIMARY KEY REFERENCES public.workers(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT true,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REPORTS & BLOCKED USERS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- 6. EMBEDDINGS TABLE FOR PGVECTOR
CREATE TABLE IF NOT EXISTS public.embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('worker', 'job')),
  entity_id UUID NOT NULL,
  embedding vector(768),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- ==============================================================================
-- JOB STATE MACHINE TRIGGER
-- open -> matched -> worker_en_route -> arrived -> in_progress -> completed | cancelled
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.validate_job_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Allowed transitions
  IF OLD.status = 'open' AND NEW.status NOT IN ('matched', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid job transition from open to %', NEW.status;
  END IF;
  IF OLD.status = 'matched' AND NEW.status NOT IN ('worker_en_route', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid job transition from matched to %', NEW.status;
  END IF;
  IF OLD.status = 'worker_en_route' AND NEW.status NOT IN ('arrived', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid job transition from worker_en_route to %', NEW.status;
  END IF;
  IF OLD.status = 'arrived' AND NEW.status NOT IN ('in_progress', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid job transition from arrived to %', NEW.status;
  END IF;
  IF OLD.status = 'in_progress' AND NEW.status NOT IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid job transition from in_progress to %', NEW.status;
  END IF;
  IF OLD.status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot transition job from terminal state %', OLD.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validate_job_state ON public.jobs;
CREATE TRIGGER tr_validate_job_state
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_job_state_transition();

-- ==============================================================================
-- DISPATCH JOB RPC
-- Selects up to 10 online workers by skill within 10km (Haversine formula), creates offers
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.dispatch_job(p_job_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_job RECORD;
  v_worker RECORD;
  v_count INTEGER := 0;
  v_distance NUMERIC;
BEGIN
  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  -- Find online workers matching skill within 10km using Haversine formula
  FOR v_worker IN
    SELECT w.*, 
           (6371 * acos(cos(radians(v_job.latitude)) * cos(radians(w.latitude)) * cos(radians(w.longitude) - radians(v_job.longitude)) + sin(radians(v_job.latitude)) * sin(radians(w.latitude)))) AS dist_km
    FROM public.workers w
    WHERE w.primary_skill = v_job.skill_needed
      AND w.is_online = true
    ORDER BY dist_km ASC
    LIMIT 10
  LOOP
    v_distance := ROUND(v_worker.dist_km::numeric, 2);
    IF v_distance <= 10.0 THEN
      INSERT INTO public.offers (
        job_id, worker_id, job_title, skill, area, city, rate_pkr, distance_km, urgency, voice_message_ur, status
      ) VALUES (
        v_job.id,
        v_worker.id,
        v_job.title,
        v_job.skill_needed,
        v_job.area,
        v_job.city,
        v_job.offered_rate_pkr,
        v_distance,
        v_job.urgency,
        'نیا کام دستیاب ہے: ' || v_job.title || ' (' || v_job.offered_rate_pkr || ' روپے)',
        'pending'
      ) ON CONFLICT DO NOTHING;
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ACCEPT OFFER RPC (Transactional SELECT ... FOR UPDATE)
-- First valid acceptance wins; all other pending offers for this job become 'taken'
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.accept_offer(p_offer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_offer RECORD;
  v_job RECORD;
BEGIN
  -- Lock offer row
  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found';
  END IF;

  IF v_offer.status <> 'pending' THEN
    RAISE EXCEPTION 'Offer is no longer available (status: %)', v_offer.status;
  END IF;

  -- Lock job row
  SELECT * INTO v_job FROM public.jobs WHERE id = v_offer.job_id FOR UPDATE;
  IF NOT FOUND OR v_job.status <> 'open' THEN
    RAISE EXCEPTION 'Job is no longer open';
  END IF;

  -- Accept this offer
  UPDATE public.offers SET status = 'accepted', updated_at = NOW() WHERE id = p_offer_id;

  -- Mark all other pending offers for this job as 'taken' (or declined)
  UPDATE public.offers 
  SET status = 'declined', market_rate_warning = 'Job already taken by another worker', updated_at = NOW() 
  WHERE job_id = v_offer.job_id AND id <> p_offer_id AND status = 'pending';

  -- Update job status to matched and assign worker
  UPDATE public.jobs 
  SET status = 'matched', assigned_worker_id = v_offer.worker_id, updated_at = NOW() 
  WHERE id = v_offer.job_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- GET JOB CONTACT RPC (Phone numbers revealed only after acceptance)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_job_contact(p_job_id UUID)
RETURNS TABLE (
  hirer_phone TEXT,
  worker_phone TEXT
) AS $$
DECLARE
  v_job RECORD;
  v_is_authorized BOOLEAN := FALSE;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  -- Check if user is hirer of this job or assigned worker
  IF v_job.hirer_id = v_user_id THEN
    v_is_authorized := TRUE;
  ELSIF EXISTS (SELECT 1 FROM public.workers WHERE id = v_job.assigned_worker_id AND user_id = v_user_id) THEN
    v_is_authorized := TRUE;
  END IF;

  IF NOT v_is_authorized OR v_job.status = 'open' THEN
    RAISE EXCEPTION 'Unauthorized or job not yet accepted/matched';
  END IF;

  RETURN QUERY
  SELECT 
    p_hirer.phone AS hirer_phone,
    p_worker.phone AS worker_phone
  FROM public.jobs j
  JOIN public.profiles p_hirer ON p_hirer.id = j.hirer_id
  LEFT JOIN public.workers w ON w.id = j.assigned_worker_id
  LEFT JOIN public.profiles p_worker ON p_worker.id = w.user_id
  WHERE j.id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.wage_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- Wage benchmarks: Everyone can read
CREATE POLICY "Anyone read wage benchmarks"
  ON public.wage_benchmarks FOR SELECT
  USING (true);

-- Offers: Workers see only offers addressed to their worker record
CREATE POLICY "Workers view own offers"
  ON public.offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workers w 
      WHERE w.id = offers.worker_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Workers update own offers"
  ON public.offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workers w 
      WHERE w.id = offers.worker_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Hirers manage offers for their jobs"
  ON public.offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = offers.job_id AND j.hirer_id = auth.uid()
    )
  );

-- Jobs: Hirers manage own jobs; workers see open/matched jobs
CREATE POLICY "Hirers manage own jobs"
  ON public.jobs FOR ALL
  USING (hirer_id = auth.uid());

CREATE POLICY "Workers view open or assigned jobs"
  ON public.jobs FOR SELECT
  USING (
    status = 'open' 
    OR assigned_worker_id IN (SELECT id FROM public.workers WHERE user_id = auth.uid())
  );
