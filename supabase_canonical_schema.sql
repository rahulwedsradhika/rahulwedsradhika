-- ==============================================================================
-- RAHUL WEDS RADHIKA: CANONICAL PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- File: /supabase_canonical_schema.sql
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CANONICAL WEDDING CONFIGURATION TABLE
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

-- Public can read the published wedding configuration
CREATE POLICY "Public can read wedding_config"
  ON public.wedding_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated administrators (logged in via Supabase Auth) can modify configuration
CREATE POLICY "Only authenticated admins can modify wedding_config"
  ON public.wedding_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 3. SHARED MEMORIES & GUEST GALLERY TABLE
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

-- Public can view approved media only
CREATE POLICY "Public can view approved memories only"
  ON public.memories
  FOR SELECT
  TO anon, authenticated
  USING (moderation_status = 'approved');

-- Authenticated admins can view all memories including pending and rejected
CREATE POLICY "Authenticated admins can view all memories"
  ON public.memories
  FOR SELECT
  TO authenticated
  USING (true);

-- Guests can upload strictly pending memories
CREATE POLICY "Guests can upload pending memories"
  ON public.memories
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    moderation_status = 'pending' AND
    length(trim(uploader_name)) > 0
  );

-- Only authenticated admins can approve, update or delete memories
CREATE POLICY "Only authenticated admins can update memories"
  ON public.memories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated admins can delete memories"
  ON public.memories
  FOR DELETE
  TO authenticated
  USING (true);


-- 4. GUESTBOOK WISHES TABLE
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

CREATE POLICY "Public can read approved wishes"
  ON public.wishes
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Admin can read all wishes"
  ON public.wishes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can submit wish"
  ON public.wishes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (approved = false AND length(trim(name)) > 0);

CREATE POLICY "Admin can update or delete wishes"
  ON public.wishes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 5. STORAGE BUCKETS CONFIGURATION
-- Bucket 1: 'wedding-media' (couple portraits, venue photos, background audio)
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

-- Bucket 2: 'wedding-memories' (guest-submitted celebration photos)
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

CREATE POLICY "Public can view wedding-media"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wedding-media');

CREATE POLICY "Only authenticated admins can manage wedding-media"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'wedding-media')
  WITH CHECK (bucket_id = 'wedding-media');

-- Storage Policies for 'wedding-memories'
DROP POLICY IF EXISTS "Public can view wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Guests can upload to pending in wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update and delete in wedding-memories" ON storage.objects;

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

CREATE POLICY "Admins can update and delete in wedding-memories"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'wedding-memories')
  WITH CHECK (bucket_id = 'wedding-memories');
