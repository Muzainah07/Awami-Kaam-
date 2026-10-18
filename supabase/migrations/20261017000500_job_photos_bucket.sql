-- ==============================================================================
-- MIGRATION: job-photos Private Storage Bucket
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated or demo upload to job-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'job-photos');

CREATE POLICY "Allow authenticated or demo read job-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'job-photos');
