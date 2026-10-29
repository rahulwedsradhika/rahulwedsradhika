-- ==============================================================================
-- SUPABASE SETUP FOR "RAHUL WEDS RADHIKA" INVITATION MUSIC & SITE SETTINGS
-- ==============================================================================
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor).
--
-- SECURITY TRADE-OFF NOTE:
-- Since admin authentication is client-side via family PIN (1128 / 2026),
-- policies below permit the public anon role to read, upload, and update the
-- "invite-audio" bucket and the "site_settings" table.
--
-- OPTIONAL STRICTER ALTERNATIVE FOR HIGH-SECURITY PRODUCTION:
-- If you prefer not to expose anon write permissions, you can create a Supabase
-- Edge Function (or server route) that checks the family PIN in the Authorization
-- header and writes using the service_role key. For private family wedding websites,
-- this direct anon setup is the simplest, zero-maintenance approach.
-- ==============================================================================

-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  audio_url TEXT,
  audio_path TEXT,
  audio_name TEXT,
  audio_volume NUMERIC DEFAULT 0.7,
  audio_loop BOOLEAN DEFAULT true,
  audio_start_at NUMERIC DEFAULT 0,
  audio_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default 'main' row if not already present
INSERT INTO public.site_settings (id, audio_volume, audio_loop, audio_start_at, audio_enabled)
VALUES ('main', 0.7, true, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (guests need to fetch audio settings on load)
CREATE POLICY "Allow public read access on site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon update access for admin panel updates
CREATE POLICY "Allow anon update access on site_settings"
  ON public.site_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon insert access (in case row was deleted)
CREATE POLICY "Allow anon insert access on site_settings"
  ON public.site_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Create Storage Bucket for audio uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invite-audio',
  'invite-audio',
  true,
  15728640, -- 15 MB in bytes
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/webm'];

-- Enable storage RLS policies for 'invite-audio' bucket
CREATE POLICY "Allow public view on invite-audio"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'invite-audio');

CREATE POLICY "Allow anon upload to invite-audio"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'invite-audio');

CREATE POLICY "Allow anon update in invite-audio"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'invite-audio')
  WITH CHECK (bucket_id = 'invite-audio');

CREATE POLICY "Allow anon delete in invite-audio"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'invite-audio');
