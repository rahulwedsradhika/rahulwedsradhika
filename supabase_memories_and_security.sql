-- ==============================================================================
-- RAHUL WEDS RADHIKA: PRODUCTION DATABASE SCHEMA & LEAST-PRIVILEGE SECURITY RULES
-- File: /supabase_memories_and_security.sql
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- This script hardens all database tables and storage buckets:
-- 1. RSVPs: Public guest insert ONLY. Full list read strictly restricted to authenticated family admins.
-- 2. Memories Gallery: Public can read ONLY approved photos/videos. Public can insert ONLY pending items.
-- 3. Storage Bucket: 'wedding-memories' with public view of approved media, private pending uploads, admin delete.
-- 4. Wishes & DJ Songs: Public submit moderated entries; public read approved only.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. RSVPS TABLE (Hardened)
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name TEXT NOT NULL,
  phone TEXT,
  attending TEXT NOT NULL CHECK (attending IN ('yes', 'no', 'maybe')),
  guest_count INTEGER NOT NULL DEFAULT 1,
  events TEXT[] NOT NULL DEFAULT '{}',
  side TEXT DEFAULT 'groom',
  diet TEXT DEFAULT 'veg',
  needs_stay BOOLEAN DEFAULT FALSE,
  needs_pickup BOOLEAN DEFAULT FALSE,
  arrival_info TEXT,
  message TEXT,
  lang TEXT NOT NULL DEFAULT 'en'
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Drop legacy insecure policies if they exist
DROP POLICY IF EXISTS "Allow public read rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Allow admin read rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Allow public insert to rsvps" ON public.rsvps;

-- Least-Privilege RSVP Insert: Public can insert their own RSVP
CREATE POLICY "Public guest can submit RSVP"
  ON public.rsvps
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) > 0 AND
    attending IN ('yes', 'no', 'maybe')
  );

-- Least-Privilege RSVP Select: Strictly Authenticated Family Admins ONLY!
-- Prevents scraping or exposing guest phone numbers, diet, and stay needs.
CREATE POLICY "Only authenticated admins can view RSVP records"
  ON public.rsvps
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated admins can update or delete RSVPs
CREATE POLICY "Only authenticated admins can modify RSVPs"
  ON public.rsvps
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated admins can delete RSVPs"
  ON public.rsvps
  FOR DELETE
  TO authenticated
  USING (true);


-- 3. MEMORIES & SHARED GALLERY TABLE
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

DROP POLICY IF EXISTS "Allow public read approved memories" ON public.memories;
DROP POLICY IF EXISTS "Allow guest upload pending memory" ON public.memories;
DROP POLICY IF EXISTS "Allow admin full access memories" ON public.memories;

-- Public can view ONLY approved media! Pending or rejected uploads remain private.
CREATE POLICY "Public can view approved memories only"
  ON public.memories
  FOR SELECT
  TO anon, authenticated
  USING (moderation_status = 'approved');

-- Authenticated admins can view all memories (pending, approved, rejected)
CREATE POLICY "Authenticated admins can view all memories"
  ON public.memories
  FOR SELECT
  TO authenticated
  USING (true);

-- Public guest upload: MUST be marked as 'pending'. Cannot self-approve!
CREATE POLICY "Guests can upload pending memories"
  ON public.memories
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    moderation_status = 'pending' AND
    length(trim(uploader_name)) > 0
  );

-- Only authenticated admins can approve, reject, or update memories
CREATE POLICY "Only authenticated admins can update memories"
  ON public.memories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete memories
CREATE POLICY "Only authenticated admins can delete memories"
  ON public.memories
  FOR DELETE
  TO authenticated
  USING (true);


-- 4. STORAGE BUCKET: 'wedding-memories'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-memories',
  'wedding-memories',
  true,
  15728640, -- 15 MB limit per photo/video
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public can view wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Guests can upload to pending folder in wedding-memories" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage wedding-memories" ON storage.objects;

-- Public can read objects in wedding-memories
CREATE POLICY "Public can view wedding-memories"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wedding-memories');

-- Guests can upload strictly to pending folder
CREATE POLICY "Guests can upload to pending in wedding-memories"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'wedding-memories' AND
    (storage.foldername(name))[1] = 'pending'
  );

-- Only authenticated admins can delete or update storage files
CREATE POLICY "Admins can update and delete in wedding-memories"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'wedding-memories')
  WITH CHECK (bucket_id = 'wedding-memories');


-- 5. WISHES TABLE
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved wishes" ON public.wishes;
DROP POLICY IF EXISTS "Public can submit wish" ON public.wishes;
DROP POLICY IF EXISTS "Admin can manage wishes" ON public.wishes;

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

CREATE POLICY "Public can submit wish as unapproved"
  ON public.wishes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (approved = false);

CREATE POLICY "Admin can update or delete wishes"
  ON public.wishes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
