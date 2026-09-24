-- =========================================================================
-- RABTA-E-HAYAT WELFARE ORGANIZATION
-- PostgreSQL Database Schema for Supabase
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    attendant_name TEXT NOT NULL DEFAULT 'Web Applicant',
    contact TEXT NOT NULL,
    cnic TEXT DEFAULT 'Online Portal Request',
    city TEXT NOT NULL DEFAULT 'Islamabad',
    sector TEXT NOT NULL DEFAULT '',
    hospital TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    units INTEGER NOT NULL DEFAULT 1,
    severity TEXT NOT NULL DEFAULT 'Code Red', -- 'Code Red' | 'Urgent' | 'Routine'
    case_type TEXT NOT NULL DEFAULT 'General Emergency',
    physician_order BOOLEAN NOT NULL DEFAULT TRUE,
    family_consent BOOLEAN NOT NULL DEFAULT TRUE,
    data_consent BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT DEFAULT '',
    stage TEXT NOT NULL DEFAULT 'Active', -- 'Active' | 'Closed' | 'Rejected'
    assigned_volunteer_id TEXT,
    assigned_volunteer_name TEXT,
    assigned_volunteer_phone TEXT,
    urgency_deadline TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for rapid queries in Admin Dashboard
CREATE INDEX IF NOT EXISTS idx_blood_requests_stage ON public.blood_requests(stage);
CREATE INDEX IF NOT EXISTS idx_blood_requests_city ON public.blood_requests(city);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON public.blood_requests(created_at DESC);

-- 2. VOLUNTEER DONORS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_donors (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    cnic TEXT DEFAULT 'Direct Web Registration',
    city TEXT NOT NULL DEFAULT 'Islamabad',
    sector TEXT NOT NULL DEFAULT 'Online Lifesaver Network',
    blood_group TEXT NOT NULL,
    last_donation DATE DEFAULT CURRENT_DATE,
    donation_count INTEGER NOT NULL DEFAULT 1,
    available_now BOOLEAN NOT NULL DEFAULT TRUE,
    medically_fit BOOLEAN NOT NULL DEFAULT TRUE,
    data_consent BOOLEAN NOT NULL DEFAULT TRUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    badge_level TEXT NOT NULL DEFAULT 'Silver Guardian',
    affiliated_university_or_org TEXT DEFAULT 'Rabta Online Volunteer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_volunteer_donors_city ON public.volunteer_donors(city);
CREATE INDEX IF NOT EXISTS idx_volunteer_donors_blood_group ON public.volunteer_donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_volunteer_donors_available ON public.volunteer_donors(available_now);

-- 3. BLOOD CAMPS TABLE
CREATE TABLE IF NOT EXISTS public.blood_camps (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    city TEXT NOT NULL,
    venue TEXT NOT NULL,
    sector TEXT NOT NULL,
    camp_date DATE NOT NULL,
    camp_time TEXT NOT NULL,
    target_units INTEGER NOT NULL DEFAULT 50,
    collected_units INTEGER NOT NULL DEFAULT 0,
    coordinator_contact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming', -- 'Upcoming' | 'Active Today' | 'Completed'
    registered_donors INTEGER NOT NULL DEFAULT 0,
    image TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL DEFAULT 'admin@rabtaehayat.pk',
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon) to submit a new blood request
CREATE POLICY "Allow public insert to blood_requests" 
ON public.blood_requests FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow public read of requests
CREATE POLICY "Allow public select from blood_requests" 
ON public.blood_requests FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow updates (changing stage, assigning volunteers)
CREATE POLICY "Allow update to blood_requests" 
ON public.blood_requests FOR UPDATE 
TO anon, authenticated 
USING (true);

-- Allow delete of blood requests
CREATE POLICY "Allow delete from blood_requests" 
ON public.blood_requests FOR DELETE 
TO anon, authenticated 
USING (true);

-- Allow public insert to volunteer donors
CREATE POLICY "Allow public insert to volunteer_donors" 
ON public.volunteer_donors FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow public select of volunteer donors
CREATE POLICY "Allow public select from volunteer_donors" 
ON public.volunteer_donors FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow update of volunteer donors (verify, toggle availability)
CREATE POLICY "Allow update to volunteer_donors" 
ON public.volunteer_donors FOR UPDATE 
TO anon, authenticated 
USING (true);

-- Allow delete of volunteer donors
CREATE POLICY "Allow delete from volunteer_donors" 
ON public.volunteer_donors FOR DELETE 
TO anon, authenticated 
USING (true);

-- Allow read on blood camps
CREATE POLICY "Allow public select from blood_camps" 
ON public.blood_camps FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow audit logs read and insert
CREATE POLICY "Allow insert and select on audit_logs" 
ON public.audit_logs FOR ALL 
TO anon, authenticated 
USING (true);

-- =========================================================================
-- REALTIME REPLICATION (For live alerts without refreshing)
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'blood_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'volunteer_donors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_donors;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
END $$;

-- =========================================================================
-- INITIAL SEED DATA (All-Pakistan Emergency Network Baseline)
-- =========================================================================
INSERT INTO public.blood_requests (
    id, patient_name, attendant_name, contact, cnic, city, sector, hospital, blood_group, units, severity, case_type, notes, stage, created_at, urgency_deadline
) VALUES 
(
    'REQ-26001', 'Ayesha Noor (7-year-old child)', 'Shahid Noor (Father)', '+92 301 6632001', '35201-2989911-0', 
    'Rawalpindi', 'Satellite Town (Block B & C / Holy Family)', 'Holy Family Hospital', 'O-', 2, 'Code Red', 
    'Trauma/Surgery', 'Emergency neurotrauma surgical procedure scheduled in OT 3.', 'Active', 
    NOW() - INTERVAL '4 hours', 'Within 2 Hours'
),
(
    'REQ-26002', 'Zainab Bibi (Thalassemia Major)', 'Muhammad Qasim (Brother)', '+92 333 8821455', '42101-6611305-1', 
    'Islamabad', 'G-8 (Markaz / Polyclinic area)', 'Pakistan Institute of Medical Sciences (PIMS)', 'B+', 1, 'Urgent', 
    'Thalassemia', 'Bi-weekly regular transfusion support. Hemoglobin dropped to 6.2 g/dL.', 'Active', 
    NOW() - INTERVAL '3 hours', 'Today by 4:00 PM'
),
(
    'REQ-26003', 'Col. (R) Tariq Mahmood', 'Hamza Tariq (Son)', '+92 345 5129988', '37405-1823901-7', 
    'Rawalpindi', 'Saddar (The Mall / Haider Rd)', 'Armed Forces Institute of Cardiology (AFIC / NIHD)', 'A-', 3, 'Code Red', 
    'Trauma/Surgery', 'Emergency Coronary Artery Bypass Graft (CABG) requiring fresh A- whole blood.', 'Active', 
    NOW() - INTERVAL '2 hours', 'Immediate'
),
(
    'REQ-26004', 'Maryam Bibi (Obstetrics Patient)', 'Farhan Saeed (Husband)', '+92 300 9554411', '37405-9988123-5', 
    'Rawalpindi', 'Chandni Chowk (Murree Road)', 'Benazir Bhutto Hospital (BBH / General)', 'AB-', 2, 'Code Red', 
    'Obstetrics/Delivery', 'Postpartum Hemorrhage (PPH) in labor room. Rare negative blood needed urgently.', 'Active', 
    NOW() - INTERVAL '1 hour', 'Within 90 Minutes'
),
(
    'REQ-26005', 'Kamran Ali (Leukemia Patient)', 'Naveed Ali (Cousin)', '+92 322 7766554', '61101-4455667-3', 
    'Islamabad', 'H-8 (Shifa / Education Zone)', 'Shifa International Hospital', 'O+', 4, 'Urgent', 
    'Oncology', 'Platelet concentrate support required for acute lymphoblastic leukemia.', 'Active', 
    NOW() - INTERVAL '30 minutes', 'Within 6 Hours'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.volunteer_donors (
    id, full_name, phone, cnic, city, sector, blood_group, last_donation, donation_count, available_now, medically_fit, verified, badge_level, affiliated_university_or_org
) VALUES
(
    'DON-31001', 'Hamza Abbasi', '+92 300 1234567', '37405-1234567-1', 'Islamabad', 'F-10 (Markaz)', 'O-', 
    CURRENT_DATE - INTERVAL '100 days', 7, TRUE, TRUE, TRUE, 'Platinum Champion', 'NUST Blood Heroes'
),
(
    'DON-31002', 'Maham Tariq', '+92 321 4011550', '37405-4422119-4', 'Rawalpindi', 'Satellite Town (Block B & C / Holy Family)', 'B+', 
    CURRENT_DATE - INTERVAL '65 days', 4, TRUE, TRUE, TRUE, 'Gold Lifesaver', 'Rawalpindi Medical University'
),
(
    'DON-31003', 'Bilal Ahmed Khan', '+92 333 5511223', '61101-8877665-3', 'Islamabad', 'Blue Area', 'A+', 
    CURRENT_DATE - INTERVAL '80 days', 9, TRUE, TRUE, TRUE, 'Platinum Champion', 'Islamabad Corporate Donors'
),
(
    'DON-31004', 'Dr. Sanaullah Malik', '+92 313 4488992', '37405-5566778-9', 'Rawalpindi', 'Westridge (1, 2, 3)', 'O+', 
    CURRENT_DATE - INTERVAL '110 days', 12, TRUE, TRUE, TRUE, 'Platinum Champion', 'Pakistan Red Crescent'
),
(
    'DON-31005', 'Usman Ghani Abbasi', '+92 312 9988771', '37405-3344556-7', 'Rawalpindi', 'Saddar (The Mall / Haider Rd)', 'A-', 
    CURRENT_DATE - INTERVAL '95 days', 5, TRUE, TRUE, TRUE, 'Gold Lifesaver', 'Armed Forces Volunteer Network'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (id, actor, action, target, created_at)
VALUES 
('LOG-1001', 'System Dispatcher', 'Initialized All-Pakistan Blood Coordination Network on PostgreSQL', 'System Core', NOW() - INTERVAL '5 hours'),
('LOG-1002', 'admin@rabtaehayat.pk', 'Verified standby volunteers in Rawalpindi & Islamabad', 'Volunteers Registry', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;
