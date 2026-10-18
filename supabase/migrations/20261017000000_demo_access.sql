-- ==============================================================================
-- MIGRATION: Hackathon Demo Access & reset_demo_data RPC
-- ==============================================================================

-- Create RPC to reset demo data securely
CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset demo job statuses back to open and unassigned
  UPDATE public.jobs
  SET status = 'open', assigned_worker_id = NULL, updated_at = NOW()
  WHERE is_demo = true;

  -- Reset demo offers status to pending
  UPDATE public.offers
  SET status = 'pending', counter_price_pkr = NULL, updated_at = NOW()
  WHERE job_id IN (SELECT id FROM public.jobs WHERE is_demo = true);

  -- Reset demo workers online status and location
  UPDATE public.workers
  SET is_online = false, updated_at = NOW()
  WHERE is_demo = true;

  -- Ensure demo user profiles exist
  INSERT INTO public.profiles (id, name, phone, role, is_guest)
  VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Ahmed Khan', '+923001111111', 'worker', false),
    ('a0000000-0000-0000-0000-000000000002', 'Sara Qureshi', '+923002222222', 'hirer', false)
  ON CONFLICT (id) DO UPDATE 
  SET name = EXCLUDED.name, phone = EXCLUDED.phone;

  -- Ensure demo worker row exists
  INSERT INTO public.workers (id, user_id, name, phone, primary_skill, skills, location_area, city, latitude, longitude, expected_daily_rate_pkr, reliability_score, completed_jobs_count, is_demo)
  VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Ahmed Khan', '+923001111111', 'painter', ARRAY['House Painting', 'Enamel Polish', 'Wall Putty', 'Texture'], 'Liaquatabad', 'Karachi', 24.9080, 67.0435, 3800, 4.60, 12, true)
  ON CONFLICT (id) DO UPDATE 
  SET is_online = false, completed_jobs_count = 12;

END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_demo_data() TO authenticated, anon, service_role;
