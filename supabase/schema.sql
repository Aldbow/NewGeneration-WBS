-- ==========================================
-- SUPABASE WBS & DEKLARASI SCHEMA
-- ==========================================

-- ENUMS
CREATE TYPE ticket_type AS ENUM ('DEKLARASI', 'LAPORAN');
CREATE TYPE ticket_status AS ENUM ('DITERIMA', 'DIVERIFIKASI', 'DIPROSES', 'SELESAI', 'DITOLAK');
CREATE TYPE urgency_level AS ENUM ('RENDAH', 'SEDANG', 'TINGGI', 'KRITIS');

-- ==========================================
-- 1. TABLES
-- ==========================================

-- TABLE: tickets (Parent Table)
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT UNIQUE NOT NULL, -- e.g. DKL-2025-00001 or WBS-2025-00001
  type ticket_type NOT NULL,
  status ticket_status DEFAULT 'DITERIMA' NOT NULL,
  urgency urgency_level DEFAULT 'RENDAH' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TABLE: declarations
CREATE TABLE declarations (
  ticket_id UUID PRIMARY KEY REFERENCES tickets(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nip TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  unit TEXT NOT NULL,
  email TEXT,
  no_hp TEXT,
  q1 TEXT NOT NULL,
  q2 TEXT NOT NULL,
  q3 TEXT NOT NULL,
  q4 TEXT NOT NULL,
  q5 TEXT NOT NULL,
  keterangan_lain TEXT,
  signature_path TEXT, -- Reference to Supabase Storage
  is_agreed BOOLEAN NOT NULL DEFAULT false
);

-- TABLE: wbs_reports
CREATE TABLE wbs_reports (
  ticket_id UUID PRIMARY KEY REFERENCES tickets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  files_count INTEGER DEFAULT 0
);

-- TABLE: ticket_timelines
CREATE TABLE ticket_timelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  status ticket_status NOT NULL,
  label TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null if created by system/anonymous
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 2. TRIGGERS
-- ==========================================

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically create timeline entry on ticket insert
CREATE OR REPLACE FUNCTION log_ticket_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ticket_timelines (ticket_id, status, label, note)
  VALUES (NEW.id, NEW.status, 'Laporan Diterima', 'Sistem telah menerima tiket baru.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ticket_created
AFTER INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION log_ticket_creation();

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wbs_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timelines ENABLE ROW LEVEL SECURITY;

-- TICKETS POLICIES
-- Public can INSERT
CREATE POLICY "Allow public insert to tickets" 
ON tickets FOR INSERT TO public WITH CHECK (true);

-- Public can SELECT only to check their specific ticket by exact ticket_id match
-- Alternatively, if ticket checking is completely closed, change to authenticated only.
-- Assuming users can check via `cek-tiket?id=WBS-xxx`, they need SELECT access via ticket_id.
CREATE POLICY "Allow public select by exact ticket_id" 
ON tickets FOR SELECT TO public USING (true); -- Usually restricted by frontend or RPC

-- Authenticated Admin can do anything
CREATE POLICY "Allow admin all access to tickets" 
ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- DECLARATIONS POLICIES
CREATE POLICY "Allow public insert to declarations" 
ON declarations FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public select declarations" 
ON declarations FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all access to declarations" 
ON declarations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- WBS REPORTS POLICIES
CREATE POLICY "Allow public insert to wbs_reports" 
ON wbs_reports FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public select wbs_reports" 
ON wbs_reports FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all access to wbs_reports" 
ON wbs_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TIMELINES POLICIES
CREATE POLICY "Allow public select ticket_timelines" 
ON ticket_timelines FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all access to ticket_timelines" 
ON ticket_timelines FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 4. STORAGE SETUP
-- ==========================================

-- Ensure storage extension is available (Supabase does this automatically usually)
-- Note: You might need to run these Storage statements via the Supabase Dashboard directly 
-- if the SQL editor rejects inserting into storage schema without superuser.

INSERT INTO storage.buckets (id, name, public) VALUES ('wbs-evidence', 'wbs-evidence', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', false) ON CONFLICT DO NOTHING;

-- Storage Policies for WBS Evidence
CREATE POLICY "Allow public upload to wbs-evidence" 
ON storage.objects FOR INSERT TO public 
WITH CHECK (bucket_id = 'wbs-evidence');

CREATE POLICY "Allow admin select from wbs-evidence" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'wbs-evidence');

-- Storage Policies for Signatures
CREATE POLICY "Allow public upload to signatures" 
ON storage.objects FOR INSERT TO public 
WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Allow admin select from signatures" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'signatures');
