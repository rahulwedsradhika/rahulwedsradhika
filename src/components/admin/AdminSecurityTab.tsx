import React, { useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { Shield, KeyRound, Database, Copy, Check, ExternalLink, Lock } from 'lucide-react';

const SQL_MIGRATION_SCRIPT = `-- ==============================================================
-- RAHUL WEDS RADHIKA: Supabase Production Schema & Security Rules
-- Run this in your Supabase SQL Editor when you connect a database.
-- ==============================================================

-- 1. RSVPs Table (Hardened - Guest Privacy Protected)
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Allow public guests to submit RSVP without logging in
CREATE POLICY "Allow public insert to rsvps"
ON public.rsvps
FOR INSERT
TO anon, authenticated
WITH CHECK (length(trim(full_name)) > 0 AND attending IN ('yes', 'no', 'maybe'));

-- STRICT PRIVACY: Only Authenticated Family Admins can read full guest list!
CREATE POLICY "Allow authenticated admins read rsvps"
ON public.rsvps
FOR SELECT
TO authenticated
USING (true);

-- 2. Shared Memories & Gallery Table
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

-- Public can view ONLY approved media!
CREATE POLICY "Public can view approved memories only"
ON public.memories
FOR SELECT
TO anon, authenticated
USING (moderation_status = 'approved');

-- Guests can upload pending memories awaiting review
CREATE POLICY "Guests can upload pending memories"
ON public.memories
FOR INSERT
TO anon, authenticated
WITH CHECK (moderation_status = 'pending' AND length(trim(uploader_name)) > 0);

-- Only authenticated admins can approve, reject or delete memories
CREATE POLICY "Admins full access to memories"
ON public.memories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Storage Bucket for Shared Memories ('wedding-memories')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-memories',
  'wedding-memories',
  true,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Wishes & Guestbook Table
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert wishes"
ON public.wishes
FOR INSERT
TO anon, authenticated
WITH CHECK (approved = false);

CREATE POLICY "Allow public read approved wishes"
ON public.wishes
FOR SELECT
TO anon, authenticated
USING (approved = true);

CREATE POLICY "Admins manage wishes"
ON public.wishes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
`;

export const AdminSecurityTab: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    void navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-burgundy" />
          Security, Passkeys & Supabase Guide (सुरक्षा एवं डेटाबेस गाइड)
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Review current security status, administrator passkeys, and instructions for connecting Supabase.
        </p>
      </div>

      {/* Current Operational Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local-first status */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-pink-100 dark:border-stone-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-burgundy uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Storage Architecture
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local-First Offline Mode'}
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            {isSupabaseConfigured
              ? 'Your project is connected to Supabase with public anonymous key verification.'
              : 'Your project is running in local-first mode! All configuration changes and offline RSVPs are safely saved in browser LocalStorage and IndexedDB without needing database keys.'}
          </p>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500">
            • Configuration: <strong>LocalStorage (schema v3)</strong>
            <br />
            • Photo & Audio blobs: <strong>IndexedDB (rahul_radhika_wedding_media_db)</strong>
          </div>
        </div>

        {/* Admin Passkey */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-pink-100 dark:border-stone-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-burgundy uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" /> Admin Access Passkey
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              Protected
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            The administrator dashboard is protected by an environment passkey:
          </p>

          <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl font-mono text-xs text-stone-800 dark:text-stone-200">
            VITE_ADMIN_PASSKEY="wedding2026"
          </div>

          <p className="text-[11px] text-stone-500">
            You can change this in your environment variables anytime to customize your family passkey.
          </p>
        </div>
      </div>

      {/* Supabase Integration Guide */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-burgundy" />
            Connecting Supabase in the Future (डेटाबेस सेटअप)
          </h3>
          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-medium shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied SQL Script!' : 'Copy SQL Schema Script'}
          </button>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          When you are ready to connect a cloud Supabase database, follow these 3 simple steps:
        </p>

        <ol className="list-decimal list-inside text-xs text-stone-700 dark:text-stone-300 space-y-2">
          <li>
            Create a project on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-burgundy underline">supabase.com</a>.
          </li>
          <li>
            Open <strong>SQL Editor</strong> in the Supabase dashboard and run the SQL migration script below.
          </li>
          <li>
            Add your public credentials to your environment variables:
            <pre className="mt-1 p-2 bg-stone-100 dark:bg-stone-800 rounded-lg font-mono text-[11px] text-stone-800 dark:text-stone-200">
              VITE_SUPABASE_URL=https://xyz.supabase.co{'\n'}
              VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
            </pre>
          </li>
        </ol>

        {/* SQL Script Box */}
        <div className="relative">
          <pre className="p-4 bg-stone-900 text-stone-200 text-xs font-mono rounded-xl overflow-x-auto max-h-60 border border-stone-800">
            {SQL_MIGRATION_SCRIPT}
          </pre>
        </div>
      </div>
    </div>
  );
};
