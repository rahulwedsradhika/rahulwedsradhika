-- ==============================================================================
-- RAHUL WEDS RADHIKA: PHASE 2B SECURITY HARDENING & DATA INTEGRITY MIGRATION
-- File: /supabase_phase2b_security_hardening.sql
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- 
-- Fixes:
-- 1. Eliminates overly broad 'TO authenticated USING (true)' policies
-- 2. Provisions 'public.wedding_admins' allowlist table
-- 3. Implements SECURITY DEFINER function 'public.is_wedding_admin(auth.uid())'
-- 4. Secures wedding_config, memories, wishes, and storage.objects with genuine admin checks
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DEDICATED WEDDING ADMINS ALLOWLIST TABLE
CREATE TABLE IF NOT EXISTS public.wedding_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.wedding_admins ENABLE ROW LEVEL SECURITY;

-- 3. SECURE HELPER FUNCTION FOR ROLE VERIFICATION
-- Uses SECURITY DEFINER with fixed search_path to prevent search-path injection.
-- Checks both the wedding_admins table and JWT app_metadata for 'admin' or 'superadmin'.
CREATE OR REPLACE FUNCTION public.is_wedding_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.wedding_admins WHERE wedding_admins.user_id = is_wedding_admin.user_id
  ) OR (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') IN ('admin', 'superadmin')
  );
END;
$$;

-- RLS for wedding_admins table: Only verified wedding admins can view admin accounts
DROP POLICY IF EXISTS "Admins can view wedding_admins" ON public.wedding_admins;
DROP POLICY IF EXISTS "Superadmins can manage wedding_admins" ON public.wedding_admins;

CREATE POLICY "Admins can view wedding_admins"
  ON public.wedding_admins
  FOR SELECT
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));

CREATE POLICY "Superadmins can manage wedding_admins"
  ON public.wedding_admins
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'superadmin' OR
    EXISTS (SELECT 1 FROM public.wedding_admins WHERE wedding_admins.user_id = auth.uid() AND role = 'superadmin')
  )
  WITH CHECK (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'superadmin' OR
    EXISTS (SELECT 1 FROM public.wedding_admins WHERE wedding_admins.user_id = auth.uid() AND role = 'superadmin')
  );


-- 4. HARDEN WEDDING CONFIGURATION TABLE
ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;

-- Drop obsolete permissive policy
DROP POLICY IF EXISTS "Only authenticated admins can modify wedding_config" ON public.wedding_config;
DROP POLICY IF EXISTS "Only authorized wedding admins can modify wedding_config" ON public.wedding_config;

-- Create hardened policy requiring verified admin status
CREATE POLICY "Only authorized wedding admins can modify wedding_config"
  ON public.wedding_config
  FOR ALL
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()))
  WITH CHECK (public.is_wedding_admin(auth.uid()));


-- 5. HARDEN SHARED MEMORIES & GALLERY TABLE
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Drop obsolete permissive policies
DROP POLICY IF EXISTS "Authenticated admins can view all memories" ON public.memories;
DROP POLICY IF EXISTS "Only authenticated admins can update memories" ON public.memories;
DROP POLICY IF EXISTS "Only authenticated admins can delete memories" ON public.memories;
DROP POLICY IF EXISTS "Admins full access to memories" ON public.memories;
DROP POLICY IF EXISTS "Authorized wedding admins can view all memories" ON public.memories;
DROP POLICY IF EXISTS "Authorized wedding admins can update memories" ON public.memories;
DROP POLICY IF EXISTS "Authorized wedding admins can delete memories" ON public.memories;

-- Verified admins can inspect all memories (pending, approved, rejected)
CREATE POLICY "Authorized wedding admins can view all memories"
  ON public.memories
  FOR SELECT
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));

-- Only verified admins can update memory status (approve / reject / edit tags)
CREATE POLICY "Authorized wedding admins can update memories"
  ON public.memories
  FOR UPDATE
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()))
  WITH CHECK (public.is_wedding_admin(auth.uid()));

-- Only verified admins can delete memories
CREATE POLICY "Authorized wedding admins can delete memories"
  ON public.memories
  FOR DELETE
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));


-- 6. HARDEN WISHES & GUESTBOOK TABLE
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Drop obsolete permissive policies
DROP POLICY IF EXISTS "Admin can read all wishes" ON public.wishes;
DROP POLICY IF EXISTS "Admin can update or delete wishes" ON public.wishes;
DROP POLICY IF EXISTS "Authorized wedding admins can read all wishes" ON public.wishes;
DROP POLICY IF EXISTS "Authorized wedding admins can update or delete wishes" ON public.wishes;

CREATE POLICY "Authorized wedding admins can read all wishes"
  ON public.wishes
  FOR SELECT
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));

CREATE POLICY "Authorized wedding admins can update or delete wishes"
  ON public.wishes
  FOR ALL
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()))
  WITH CHECK (public.is_wedding_admin(auth.uid()));


-- 7. HARDEN STORAGE BUCKET POLICIES
-- Drop obsolete permissive policies
DROP POLICY IF EXISTS "Only authenticated admins can manage wedding-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage wedding-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update and delete in wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Authorized wedding admins can manage wedding-media" ON storage.objects;
DROP POLICY IF EXISTS "Authorized wedding admins can update and delete in wedding-memories" ON storage.objects;

-- Only verified admins can upload, update, or delete wedding assets (couple photos, audio, venue pics)
CREATE POLICY "Authorized wedding admins can manage wedding-media"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'wedding-media' AND public.is_wedding_admin(auth.uid()))
  WITH CHECK (bucket_id = 'wedding-media' AND public.is_wedding_admin(auth.uid()));

-- Only verified admins can delete or re-moderate images in wedding-memories
CREATE POLICY "Authorized wedding admins can update and delete in wedding-memories"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'wedding-memories' AND public.is_wedding_admin(auth.uid()))
  WITH CHECK (bucket_id = 'wedding-memories' AND public.is_wedding_admin(auth.uid()));


-- ==============================================================================
-- INSTRUCTIONS TO PROVISION YOUR FIRST ADMIN USER:
-- ==============================================================================
-- 1. Create a user under Supabase Dashboard > Authentication > Users (e.g. admin@wedding.com)
-- 2. Copy the user's UUID
-- 3. Execute the following SQL statement in the SQL Editor:
--
--    INSERT INTO public.wedding_admins (user_id, role, notes)
--    VALUES ('<PASTE_USER_UUID_HERE>', 'admin', 'Family Lead Administrator')
--    ON CONFLICT (user_id) DO NOTHING;
--
-- 4. Or set their user metadata in Dashboard or CLI:
--    UPDATE auth.users 
--    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
--    WHERE email = 'admin@wedding.com';
-- ==============================================================================
