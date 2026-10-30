-- ==============================================================================
-- RAHUL WEDS RADHIKA: CANONICAL PRODUCTION DATABASE SCHEMA & HARDENED RLS POLICIES
-- File: /supabase_canonical_schema.sql
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. WEDDING ADMINS ALLOWLIST TABLE & SECURITY DEFINER HELPER
CREATE TABLE IF NOT EXISTS public.wedding_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.wedding_admins ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Admins can view wedding_admins" ON public.wedding_admins;
CREATE POLICY "Admins can view wedding_admins"
  ON public.wedding_admins
  FOR SELECT
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));


-- 3. CANONICAL WEDDING CONFIGURATION TABLE
-- Stores the complete, versioned JSON configuration for the entire wedding website.
CREATE TABLE IF NOT EXISTS public.wedding_config (
  id TEXT PRIMARY KEY DEFAULT 'canonical',
  version INTEGER NOT NULL DEFAULT 3,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read wedding_config" ON public.wedding_config;
DROP POLICY IF EXISTS "Only authenticated admins can modify wedding_config" ON public.wedding_config;
DROP POLICY IF EXISTS "Only authorized wedding admins can modify wedding_config" ON public.wedding_config;

-- Public can read the published wedding configuration
CREATE POLICY "Public can read wedding_config"
  ON public.wedding_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only verified wedding admins can modify configuration
CREATE POLICY "Only authorized wedding admins can modify wedding_config"
  ON public.wedding_config
  FOR ALL
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()))
  WITH CHECK (public.is_wedding_admin(auth.uid()));


-- 4. SHARED MEMORIES & GUEST GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.memories (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  ceremony_id TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  uploader_name TEXT NOT NULL,
  uploader_side TEXT DEFAULT 'friend',
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  file_size BIGINT
);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved memories only" ON public.memories;
DROP POLICY IF EXISTS "Authenticated admins can view all memories" ON public.memories;
DROP POLICY IF EXISTS "Guests can upload pending memories" ON public.memories;
DROP POLICY IF EXISTS "Only authenticated admins can update memories" ON public.memories;
DROP POLICY IF EXISTS "Only authenticated admins can delete memories" ON public.memories;
DROP POLICY IF EXISTS "Authorized wedding admins can view all memories" ON public.memories;
DROP POLICY IF EXISTS "Authorized wedding admins can update memories" ON public.memories;
DROP POLICY IF EXISTS "Authorized wedding admins can delete memories" ON public.memories;

-- Public can view approved media only
CREATE POLICY "Public can view approved memories only"
  ON public.memories
  FOR SELECT
  TO anon, authenticated
  USING (moderation_status = 'approved');

-- Verified admins can inspect all memories including pending and rejected
CREATE POLICY "Authorized wedding admins can view all memories"
  ON public.memories
  FOR SELECT
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));

-- Guests can upload strictly pending memories
CREATE POLICY "Guests can upload pending memories"
  ON public.memories
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    moderation_status = 'pending' AND
    length(trim(uploader_name)) > 0
  );

-- Only verified wedding admins can approve, update or delete memories
CREATE POLICY "Authorized wedding admins can update memories"
  ON public.memories
  FOR UPDATE
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()))
  WITH CHECK (public.is_wedding_admin(auth.uid()));

CREATE POLICY "Authorized wedding admins can delete memories"
  ON public.memories
  FOR DELETE
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));


-- 5. GUESTBOOK WISHES TABLE
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved wishes" ON public.wishes;
DROP POLICY IF EXISTS "Admin can read all wishes" ON public.wishes;
DROP POLICY IF EXISTS "Public can submit wish" ON public.wishes;
DROP POLICY IF EXISTS "Admin can update or delete wishes" ON public.wishes;
DROP POLICY IF EXISTS "Authorized wedding admins can read all wishes" ON public.wishes;
DROP POLICY IF EXISTS "Authorized wedding admins can update or delete wishes" ON public.wishes;

CREATE POLICY "Public can read approved wishes"
  ON public.wishes
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Authorized wedding admins can read all wishes"
  ON public.wishes
  FOR SELECT
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()));

CREATE POLICY "Public can submit wish"
  ON public.wishes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (approved = false AND length(trim(name)) > 0);

CREATE POLICY "Authorized wedding admins can update or delete wishes"
  ON public.wishes
  FOR ALL
  TO authenticated
  USING (public.is_wedding_admin(auth.uid()))
  WITH CHECK (public.is_wedding_admin(auth.uid()));


-- 6. STORAGE BUCKETS CONFIGURATION
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-media',
  'wedding-media',
  true,
  26214400, -- 25 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/wav', 'audio/ogg'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-memories',
  'wedding-memories',
  true,
  15728640, -- 15 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Storage Policies for 'wedding-media'
DROP POLICY IF EXISTS "Public can view wedding-media" ON storage.objects;
DROP POLICY IF EXISTS "Only authenticated admins can manage wedding-media" ON storage.objects;
DROP POLICY IF EXISTS "Authorized wedding admins can manage wedding-media" ON storage.objects;

CREATE POLICY "Public can view wedding-media"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wedding-media');

CREATE POLICY "Authorized wedding admins can manage wedding-media"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'wedding-media' AND public.is_wedding_admin(auth.uid()))
  WITH CHECK (bucket_id = 'wedding-media' AND public.is_wedding_admin(auth.uid()));

-- Storage Policies for 'wedding-memories'
DROP POLICY IF EXISTS "Public can view wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Guests can upload to pending in wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update and delete in wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Authorized wedding admins can update and delete in wedding-memories" ON storage.objects;

CREATE POLICY "Public can view wedding-memories"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wedding-memories');

CREATE POLICY "Guests can upload to pending in wedding-memories"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'wedding-memories' AND
    (storage.foldername(name))[1] = 'pending'
  );

CREATE POLICY "Authorized wedding admins can update and delete in wedding-memories"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'wedding-memories' AND public.is_wedding_admin(auth.uid()))
  WITH CHECK (bucket_id = 'wedding-memories' AND public.is_wedding_admin(auth.uid()));
