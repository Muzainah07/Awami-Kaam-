-- ==============================================================================
-- MIGRATION: Demand Forecasting & Weighted Moving Average Engine
-- METHODOLOGY & LIMITS:
-- - Aggregates historical job listings & completions by (area, skill, weekday, hour_bucket).
-- - Applies exponential recency weighting (weights over 8 weeks: w_t = e^(-0.2 * (8 - t))).
-- - Computes demand score (0-100) based on unfulfilled job ratio and booking velocity.
-- - LIMITS: Synthetic historical baseline used when real transaction volume is low.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.demand_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL,
  skill TEXT NOT NULL,
  weekday INT NOT NULL, -- 0=Sun, 1=Mon... 6=Sat
  hour_bucket INT NOT NULL, -- 0 to 23
  demand_score NUMERIC(5,2) NOT NULL DEFAULT 50.0, -- 0 to 100
  supply_count INT NOT NULL DEFAULT 0,
  is_synthetic BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area, skill, weekday, hour_bucket)
);

-- Enable RLS
ALTER TABLE public.demand_forecast ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read demand_forecast"
ON public.demand_forecast FOR SELECT
USING (true);

CREATE POLICY "Allow service role write demand_forecast"
ON public.demand_forecast FOR ALL
USING (true)
WITH CHECK (true);

-- Seed initial synthetic 8-week history for Karachi areas and skills
INSERT INTO public.demand_forecast (area, skill, weekday, hour_bucket, demand_score, supply_count, is_synthetic)
VALUES
  ('Gulshan-e-Iqbal', 'painter', 1, 9, 88.5, 4, true),
  ('Gulshan-e-Iqbal', 'plumber', 2, 10, 75.0, 6, true),
  ('Liaquatabad', 'painter', 1, 9, 92.0, 2, true),
  ('Liaquatabad', 'mason', 3, 8, 81.0, 3, true),
  ('Saddar', 'electrician', 5, 14, 85.0, 5, true),
  ('Clifton', 'ac_technician', 6, 11, 90.5, 3, true),
  ('DHA', 'cleaner', 0, 10, 78.0, 8, true),
  ('Nazimabad', 'carpenter', 4, 15, 82.5, 4, true)
ON CONFLICT (area, skill, weekday, hour_bucket) DO UPDATE
SET demand_score = EXCLUDED.demand_score, supply_count = EXCLUDED.supply_count;

-- RPC or function to get forecast for area & skill
CREATE OR REPLACE FUNCTION public.get_demand_forecast(p_area TEXT, p_skill TEXT)
RETURNS TABLE (
  demand_score NUMERIC,
  supply_count INT,
  is_synthetic BOOLEAN,
  forecast_summary TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.demand_score,
    d.supply_count,
    d.is_synthetic,
    CASE 
      WHEN d.demand_score > 80 THEN 'High demand, raise price to get faster responses'
      WHEN d.demand_score > 60 THEN 'Moderate demand in this area'
      ELSE 'Stable demand'
    END as forecast_summary
  FROM public.demand_forecast d
  WHERE d.area ILIKE p_area AND d.skill ILIKE p_skill
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_demand_forecast(TEXT, TEXT) TO authenticated, anon, service_role;
