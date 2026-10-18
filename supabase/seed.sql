-- ==============================================================================
-- AWAMI KAM (عوامی کام) - SUPABASE SEED DATA
-- 25 Realistic Karachi Workers & 8 Sample Jobs (flagged is_demo = true)
-- ==============================================================================

-- 0. SEED AUTH USERS (to satisfy foreign key constraint on public.profiles)
DO $$
BEGIN
  INSERT INTO auth.users (id, aud, role, email, phone, encrypted_password, email_confirmed_at, phone_confirmed_at, created_at, updated_at)
  VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'worker.demo@awamikam.pk', '+923014458421', '', NOW(), NOW(), NOW(), NOW()),
    ('a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'hirer.demo@awamikam.pk', '+923332211948', '', NOW(), NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 1. SEED PROFILES (Ahmed Khan as Worker, Dr. Bilal Qureshi as Hirer)
INSERT INTO public.profiles (id, name, phone, role, is_guest)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Ahmed Khan', '0301-4458421', 'worker', false),
  ('a0000000-0000-0000-0000-000000000002', 'Dr. Bilal Qureshi', '0333-2211948', 'hirer', false)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED 25 REALISTIC KARACHI WORKERS
INSERT INTO public.workers (
  id, user_id, name, phone, detected_language, language_code, primary_skill, skills, 
  location_area, city, latitude, longitude, availability, is_online, experience_years, 
  expected_daily_rate_pkr, reliability_score, completed_jobs_count, badge, voice_intro_text, 
  avatar_color, confidence, is_demo
) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Ahmed Khan', '0301-4458421', 'Urdu', 'ur', 'painter', ARRAY['Wall Painting', 'Distemper', 'Enamel Polish', 'Exterior Paint'], 'Liaquatabad', 'Karachi', 24.9080, 67.0435, 'today', true, 9, 3800, 4.9, 74, 'Master Craftsman', 'احمد خان - لیاقت آباد، نو سال کا تجربہ، پینٹر', '#0B6B3A', 0.98, true),
  ('b0000000-0000-0000-0000-000000000002', NULL, 'Bashir Ahmed', '0321-5589102', 'Punjabi', 'pa', 'plumber', ARRAY['Pipe Fitting', 'Bathroom Sanity', 'Motor Pump Repair', 'Geyser Installation'], 'Gulshan-e-Iqbal', 'Karachi', 24.9207, 67.0928, 'today', true, 12, 4000, 4.8, 92, 'Top Rated', 'بشیر احمد - گلشن اقبال، بارہ سال تجربہ، پلمبر', '#06B6D4', 0.96, true),
  ('b0000000-0000-0000-0000-000000000003', NULL, 'Gul Khan Afridi', '0333-2211948', 'Pashto', 'ps', 'electrician', ARRAY['Short Circuit Repair', 'Wiring', 'DB Board', 'UPS & Inverter Setup'], 'Saddar', 'Karachi', 24.8569, 67.0307, 'today', true, 7, 4200, 4.9, 61, 'Top Rated', 'ګل خان افریدی - صدر، الیکٹریشن', '#F97316', 0.97, true),
  ('b0000000-0000-0000-0000-000000000004', NULL, 'Nawaz Ali Mallah', '0304-7786519', 'Sindhi', 'sd', 'mason', ARRAY['Brick Masonry', 'Plastering', 'Foundation Work', 'Roof Concrete'], 'Orangi Town', 'Karachi', 24.9538, 66.9942, 'today', true, 15, 4500, 4.7, 110, 'Verified Chowk', 'نواز علي - اورنگي ٽائون، راڄ مستري', '#EAB308', 0.95, true),
  ('b0000000-0000-0000-0000-000000000005', NULL, 'Muhammad Tariq', '0312-3397742', 'Saraiki', 'skr', 'carpenter', ARRAY['Door Repair', 'Cabinet Making', 'Wooden Partition', 'Lock Replacement'], 'Nazimabad', 'Karachi', 24.9180, 67.0324, 'today', true, 11, 4200, 4.8, 83, 'Master Craftsman', 'محمد طارق - ناظم آباد، کارپینٹر', '#8B5CF6', 0.94, true),
  ('b0000000-0000-0000-0000-000000000006', NULL, 'Sajjad Hussain', '0345-9923391', 'Urdu', 'ur', 'helper', ARRAY['Demolition', 'Material Shifting', 'Debris Cleaning', 'Digging'], 'Liaquatabad', 'Karachi', 24.9080, 67.0435, 'today', true, 4, 2200, 4.6, 38, 'Verified Chowk', 'سجاد حسین - لیاقت آباد، مزدور', '#10B981', 0.92, true),
  ('b0000000-0000-0000-0000-000000000007', NULL, 'Qari Aslam', '0300-8814419', 'Urdu', 'ur', 'painter', ARRAY['Interior Paint', 'Weather Sheet', 'Texture Paint', 'Wood Polish'], 'Gulshan-e-Iqbal', 'Karachi', 24.9207, 67.0928, 'today', true, 8, 3800, 4.9, 53, 'Top Rated', 'قاری اسلم - گلشن اقبال، پینٹر', '#0B6B3A', 0.98, true),
  ('b0000000-0000-0000-0000-000000000008', NULL, 'Mirza Zulfiqar', '0315-4412281', 'Punjabi', 'pa', 'tile_worker', ARRAY['Porcelain Tiles', 'Marble Polishing', 'Bathroom Tiling', 'Kitchen Dado'], 'Federal B Area', 'Karachi', 24.9385, 67.0673, 'today', true, 14, 4800, 4.9, 98, 'Master Craftsman', 'مرزا ذوالفقار - فیڈرل بی ایریا، ٹائل مستری', '#EC4899', 0.96, true),
  ('b0000000-0000-0000-0000-000000000009', NULL, 'Jan Sher Khattak', '0334-6629012', 'Pashto', 'ps', 'welder', ARRAY['Iron Gate Fabrication', 'Window Grill', 'Shed Welding', 'Shutter Repair'], 'Korangi', 'Karachi', 24.8322, 67.1354, 'today', true, 10, 4400, 4.7, 59, 'Verified Chowk', 'جان شیر - کورنگی، ویلڈر', '#F43F5E', 0.95, true),
  ('b0000000-0000-0000-0000-000000000010', NULL, 'Farooq Baloch', '0308-9915512', 'Sindhi', 'sd', 'helper', ARRAY['Cement Mixing', 'Bricks Hauling', 'Loading Unloading', 'Site Clearance'], 'Malir', 'Karachi', 24.8967, 67.1981, 'today', true, 6, 2300, 4.8, 45, 'Rising Star', 'فاروق بلوچ - ملیر، مزدور', '#10B981', 0.94, true),
  ('b0000000-0000-0000-0000-000000000011', NULL, 'Kashif Mehmood', '0322-1208710', 'Urdu', 'ur', 'electrician', ARRAY['Solar Inverter', 'Ceiling Fan Installation', 'Circuit Breakers', 'Home Automation'], 'Gulshan-e-Iqbal', 'Karachi', 24.9207, 67.0928, 'today', true, 9, 4500, 4.9, 88, 'Top Rated', 'کاشف محمود - گلشن اقبال، الیکٹریشن', '#F97316', 0.97, true),
  ('b0000000-0000-0000-0000-000000000012', NULL, 'Ghulam Rasool', '0302-7711190', 'Punjabi', 'pa', 'painter', ARRAY['Plastic Emulsion', 'Stencils', 'False Ceiling Paint', 'Waterproofing'], 'Nazimabad', 'Karachi', 24.9180, 67.0324, 'tomorrow', true, 7, 3700, 4.7, 41, 'Verified Chowk', 'غلام رسول - ناظم آباد، پینٹر', '#0B6B3A', 0.93, true),
  ('b0000000-0000-0000-0000-000000000013', NULL, 'Akram Mistry', '0331-5504409', 'Urdu', 'ur', 'mason', ARRAY['Boundary Wall', 'Lintel Casting', 'Bathroom Waterproofing', 'Compound Wall'], 'Liaquatabad', 'Karachi', 24.9080, 67.0435, 'today', true, 18, 4600, 5.0, 142, 'Master Craftsman', 'اکرم مستری - لیاقت آباد، راج مستری', '#EAB308', 0.99, true),
  ('b0000000-0000-0000-0000-000000000014', NULL, 'Niamatullah Khan', '0346-2207321', 'Pashto', 'ps', 'helper', ARRAY['Earth Moving', 'Concrete Pouring', 'Loading Truck', 'Heavy Lifting'], 'Orangi Town', 'Karachi', 24.9538, 66.9942, 'today', true, 5, 2100, 4.7, 49, 'Verified Chowk', 'نعمت اللہ - اورنگی، مزدور', '#10B981', 0.95, true),
  ('b0000000-0000-0000-0000-000000000015', NULL, 'Zahid Hussain', '0305-9908821', 'Saraiki', 'skr', 'plumber', ARRAY['Sewerage Line', 'Overhead Tank Connection', 'Water Leakage Fix', 'Taps & Mixers'], 'Saddar', 'Karachi', 24.8569, 67.0307, 'today', true, 8, 3900, 4.8, 67, 'Top Rated', 'زاہد حسین - صدر، پلمبر', '#06B6D4', 0.96, true),
  ('b0000000-0000-0000-0000-000000000016', NULL, 'Arshad Carpenter', '0313-4426618', 'Urdu', 'ur', 'carpenter', ARRAY['Kitchen Cabinets', 'Wardrobe', 'Bed Repair', 'MDF Work'], 'Gulshan-e-Iqbal', 'Karachi', 24.9207, 67.0928, 'today', true, 13, 4600, 4.9, 85, 'Master Craftsman', 'ارشد کارپینٹر - گلشن اقبال، فرنیچر و کارپینٹری', '#8B5CF6', 0.97, true),
  ('b0000000-0000-0000-0000-000000000017', NULL, 'Sikandar Soomro', '0306-3391425', 'Sindhi', 'sd', 'painter', ARRAY['Wall Putty', 'Deco Finish', 'Spray Paint', 'Emulsion'], 'Malir', 'Karachi', 24.8967, 67.1981, 'today', true, 6, 3500, 4.6, 34, 'Rising Star', 'سکندر سومرو - ملیر، رنگ ساز', '#0B6B3A', 0.94, true),
  ('b0000000-0000-0000-0000-000000000018', NULL, 'Abdul Wahab', '0335-8817841', 'Pashto', 'ps', 'electrician', ARRAY['Three Phase DB', 'Generator Hookup', 'Industrial Wiring', 'LED Panel'], 'Korangi', 'Karachi', 24.8322, 67.1354, 'today', true, 11, 4500, 4.8, 73, 'Top Rated', 'عبدالوہاب - کورنگی، الیکٹریشن', '#F97316', 0.96, true),
  ('b0000000-0000-0000-0000-000000000019', NULL, 'Imtiaz Gujjar', '0324-4419311', 'Punjabi', 'pa', 'mason', ARRAY['Plaster Design', 'Stone Masonry', 'Tile Setting', 'Cement Casting'], 'Federal B Area', 'Karachi', 24.9385, 67.0673, 'today', true, 16, 4700, 4.9, 125, 'Master Craftsman', 'امتیاز گجر - فیڈرل بی ایریا، راج مستری', '#EAB308', 0.98, true),
  ('b0000000-0000-0000-0000-000000000020', NULL, 'Danyal Masih', '0307-5512201', 'Urdu', 'ur', 'cleaner', ARRAY['Deep Cleaning', 'Water Tank Washing', 'Debris Clearing', 'Painting Prep'], 'Saddar', 'Karachi', 24.8569, 67.0307, 'today', true, 5, 2500, 4.8, 57, 'Verified Chowk', 'دانیال مسیح - صدر، لیبر و صفائی', '#10B981', 0.95, true),
  ('b0000000-0000-0000-0000-000000000021', NULL, 'Habibullah Tareen', '0332-9908109', 'Pashto', 'ps', 'tile_worker', ARRAY['Granite Stairs', 'Floor Tiling', 'Waterproof Grouting', 'Laser Levelling'], 'Nazimabad', 'Karachi', 24.9180, 67.0324, 'tomorrow', true, 9, 4900, 4.9, 64, 'Top Rated', 'حبیب اللہ - ناظم آباد، ٹائل کاریگر', '#EC4899', 0.96, true),
  ('b0000000-0000-0000-0000-000000000022', NULL, 'Rashid Minhas', '0316-7715214', 'Urdu', 'ur', 'plumber', ARRAY['PPR Fitting', 'Underground Line Leakage', 'RO Filter Installation', 'Motor Pump'], 'Liaquatabad', 'Karachi', 24.9080, 67.0435, 'today', true, 10, 3900, 4.8, 81, 'Top Rated', 'راشد منہاس - لیاقت آباد، پلمبر', '#06B6D4', 0.97, true),
  ('b0000000-0000-0000-0000-000000000023', NULL, 'Shahbaz Bhatti', '0323-2214890', 'Punjabi', 'pa', 'ac_technician', ARRAY['Split AC Service', 'Gas Refill', 'Compressor Replacement', 'Inverter PCB'], 'Gulshan-e-Iqbal', 'Karachi', 24.9207, 67.0928, 'today', true, 8, 4300, 4.7, 51, 'Verified Chowk', 'شہباز بھٹی - گلشن، اے سی ٹیکنیشن', '#3B82F6', 0.95, true),
  ('b0000000-0000-0000-0000-000000000024', NULL, 'Manzoor Khoso', '0309-8803190', 'Sindhi', 'sd', 'carpenter', ARRAY['Wooden Windows', 'Cupboard Repair', 'Dressing Table', 'Sofa Frame'], 'Orangi Town', 'Karachi', 24.9538, 66.9942, 'today', true, 12, 4100, 4.7, 70, 'Verified Chowk', 'منظور کوسو - اورنگی، کارپینٹر', '#8B5CF6', 0.94, true),
  ('b0000000-0000-0000-0000-000000000025', NULL, 'Sardar Khan', '0347-1196129', 'Pashto', 'ps', 'painter', ARRAY['Exterior Weathercoat', 'High Wall Scaffolding', 'Texture Rollers', 'Primer'], 'Korangi', 'Karachi', 24.8322, 67.1354, 'today', true, 7, 3600, 4.8, 55, 'Rising Star', 'سردار خان - کورنگی، پینٹر', '#0B6B3A', 0.96, true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED 8 SAMPLE JOBS ACROSS KARACHI
INSERT INTO public.jobs (
  id, hirer_id, title, job_type, skill_needed, workers_needed, area, city, 
  latitude, longitude, date_option, time_slot, job_size, urgency, special_requirements, 
  offered_rate_pkr, status, is_demo
) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2 Rooms Wall Painting', 'House Painting', 'painter', 1, 'Gulshan-e-Iqbal', 'Karachi', 24.9207, 67.0928, 'today', 'morning', '2 rooms', 'normal', 'Bring rollers and brushes. Paint provided.', 3800, 'open', true),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Bathroom Water Leakage & PPR Pipe Repair', 'Sanitary Plumbing', 'plumber', 1, 'Liaquatabad', 'Karachi', 24.9080, 67.0435, 'today', 'morning', '1 bathroom', 'urgent', 'Water leaking into floor below.', 4200, 'open', true),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Main DB Board Circuit Breaker Tripping Fix', 'Electrical Repair', 'electrician', 1, 'Saddar', 'Karachi', 24.8569, 67.0307, 'today', 'morning', 'Commercial shop', 'urgent', 'Short circuit tripping breakers.', 4500, 'open', true),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Roof Concrete Patching & Brick Wall Plaster', 'Masonry Construction', 'mason', 2, 'Orangi Town', 'Karachi', 24.9538, 66.9942, 'today', 'morning', 'Boundary wall', 'normal', 'Plaster and roof cement patch.', 4600, 'open', true),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Kitchen Wood Cabinets Hinge & Sliding Repair', 'Carpentry', 'carpenter', 1, 'Nazimabad', 'Karachi', 24.9180, 67.0324, 'today', 'morning', '4 cabinets', 'normal', 'Replace hydraulic hinges.', 4000, 'open', true),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Construction Debris & Malba Shifting to Truck', 'General Labor', 'helper', 2, 'Liaquatabad', 'Karachi', 24.9080, 67.0435, 'today', 'morning', '1 pickup truck', 'normal', 'Carry debris to truck.', 2400, 'open', true),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'Split AC Master Service & Gas Check', 'AC Maintenance', 'ac_technician', 1, 'Gulshan-e-Iqbal', 'Karachi', 24.9207, 67.0928, 'tomorrow', 'morning', '2 split units', 'normal', 'Chemical service and filter wash.', 4500, 'open', true),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'Full House Deep Cleaning & Floor Wash', 'Deep Cleaning', 'cleaner', 2, 'Clifton', 'Karachi', 24.8214, 67.0326, 'today', 'morning', 'Ground floor', 'normal', 'Post-renovation dust cleaning.', 3200, 'open', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SAMPLE ACTIVE OFFER
INSERT INTO public.offers (
  id, job_id, worker_id, job_title, skill, area, city, rate_pkr, 
  distance_km, urgency, voice_message_ur, voice_message_en, is_below_market, status, is_demo
) VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  '2 Rooms Wall Painting',
  'painter',
  'Gulshan-e-Iqbal',
  'Karachi',
  3800,
  2.8,
  'normal',
  'احمد بھائی، گلشن اقبال میں دو کمروں کی پینٹنگ کی نوکری ہے۔ مزدوری ۳۸۰۰ روپے۔ کیا آپ جانا چاہتے ہیں؟',
  'Ahmed bhai, 2 rooms wall painting job in Gulshan-e-Iqbal for 3,800 PKR. Do you want to accept?',
  false,
  'pending',
  true
) ON CONFLICT (id) DO NOTHING;
