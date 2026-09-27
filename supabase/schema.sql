-- VSMS Supabase Schema Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  contact_email TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Organization Dynamic Fields
CREATE TABLE IF NOT EXISTS public.organization_fields (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  is_required INTEGER NOT NULL DEFAULT 0,
  show_in_table INTEGER NOT NULL DEFAULT 0,
  show_on_badge INTEGER NOT NULL DEFAULT 0,
  options_json TEXT,
  placeholder TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_baseline INTEGER NOT NULL DEFAULT 0
);

-- 3. Users
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  fullName TEXT NOT NULL,
  role TEXT NOT NULL,
  desk_location TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visitors
CREATE TABLE IF NOT EXISTS public.visitors (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  fullName TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  idType TEXT,
  idNumber TEXT,
  hostName TEXT,
  department TEXT,
  purpose TEXT,
  checkInTime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checkOutTime TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Checked-In',
  badgeId TEXT,
  expectedDurationMinutes INTEGER,
  vehiclePlate TEXT,
  notes TEXT,
  avatar TEXT,
  custom_data_json JSONB
);

-- 5. Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  head TEXT,
  floor TEXT
);

-- 6. Hosts
CREATE TABLE IF NOT EXISTS public.hosts (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  name TEXT NOT NULL,
  title TEXT,
  deptId TEXT,
  email TEXT
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  userId TEXT,
  userName TEXT,
  action TEXT NOT NULL,
  resourceType TEXT,
  resourceId TEXT,
  details TEXT
);

-- Row Level Security (RLS) policies allowing public read-write for client app
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on organizations" ON public.organizations;
CREATE POLICY "Allow anon all on organizations" ON public.organizations FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on organization_fields" ON public.organization_fields;
CREATE POLICY "Allow anon all on organization_fields" ON public.organization_fields FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on users" ON public.users;
CREATE POLICY "Allow anon all on users" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on visitors" ON public.visitors;
CREATE POLICY "Allow anon all on visitors" ON public.visitors FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on departments" ON public.departments;
CREATE POLICY "Allow anon all on departments" ON public.departments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on hosts" ON public.hosts;
CREATE POLICY "Allow anon all on hosts" ON public.hosts FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on audit_logs" ON public.audit_logs;
CREATE POLICY "Allow anon all on audit_logs" ON public.audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
