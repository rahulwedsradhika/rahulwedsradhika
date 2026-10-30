import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { Shield, KeyRound, Database, Copy, Check, ExternalLink, Lock, AlertTriangle, Users } from 'lucide-react';

const SQL_MIGRATION_SCRIPT = `-- ==============================================================
-- RAHUL WEDS RADHIKA: Canonical Production Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================

-- 1. Canonical Wedding Configuration Table
CREATE TABLE IF NOT EXISTS public.wedding_config (
  id TEXT PRIMARY KEY DEFAULT 'canonical',
  version INTEGER NOT NULL DEFAULT 3,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read wedding_config"
  ON public.wedding_config FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Only authenticated admins can modify wedding_config"
  ON public.wedding_config FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

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

CREATE POLICY "Public can view approved memories only"
  ON public.memories FOR SELECT
  TO anon, authenticated USING (moderation_status = 'approved');

CREATE POLICY "Authenticated admins can view all memories"
  ON public.memories FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Guests can upload pending memories"
  ON public.memories FOR INSERT
  TO anon, authenticated
  WITH CHECK (moderation_status = 'pending' AND length(trim(uploader_name)) > 0);

CREATE POLICY "Admins full access to memories"
  ON public.memories FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 3. Storage Buckets ('wedding-media' and 'wedding-memories')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('wedding-media', 'wedding-media', true, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/wav', 'audio/ogg']),
  ('wedding-memories', 'wedding-memories', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public view wedding-media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'wedding-media');

CREATE POLICY "Admins manage wedding-media" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'wedding-media') WITH CHECK (bucket_id = 'wedding-media');

-- 4. Wishes & Guestbook Table
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved wishes" ON public.wishes
  FOR SELECT TO anon, authenticated USING (approved = true);

CREATE POLICY "Public submit wishes" ON public.wishes
  FOR INSERT TO anon, authenticated WITH CHECK (approved = false AND length(trim(name)) > 0);

CREATE POLICY "Admins manage wishes" ON public.wishes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
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
          Security, Authentication & Supabase (सुरक्षा एवं डेटाबेस सेटअप)
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Review authentication mechanisms, database Row Level Security (RLS), and production deployment instructions.
        </p>
      </div>

      {/* Operational Security Architecture Warning */}
      <div className="p-5 rounded-2xl border bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-amber-900 dark:text-amber-200">
            Security Notice: Passkey vs Supabase Auth
          </h3>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
            Client-side passkeys (such as <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded font-mono">VITE_ADMIN_PASSKEY</code>) are exposed in the browser bundle and only serve as an offline gate for local development. For production databases, writes are enforced strictly at the database layer via <strong>Supabase Row Level Security (RLS)</strong> requiring an authenticated JWT (<code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded font-mono">auth.role() = 'authenticated'</code>).
          </p>
        </div>
      </div>

      {/* Current Operational Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase status */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-pink-100 dark:border-stone-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-burgundy uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Persistence Layer
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            {isSupabaseConfigured
              ? 'Your project is connected to Supabase. Public configuration is synced across all devices with RLS security policies enabled.'
              : 'Running in local-first development mode. Configuration changes are saved to this browser only. Connect Supabase to sync live changes to guests on all devices.'}
          </p>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500">
            • Configuration: <strong>{isSupabaseConfigured ? 'Supabase wedding_config table + Local cache' : 'Browser LocalStorage (v3)'}</strong>
            <br />
            • Media Storage: <strong>{isSupabaseConfigured ? 'Supabase Storage (wedding-media)' : 'IndexedDB (Local)'}</strong>
          </div>
        </div>

        {/* Admin Account Setup */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-pink-100 dark:border-stone-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-burgundy uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Production Admin Auth
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              Supabase Auth
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            To create authorized administrators for the cloud database:
          </p>

          <ol className="list-decimal list-inside text-xs text-stone-700 dark:text-stone-300 space-y-1">
            <li>Open your Supabase Project Dashboard.</li>
            <li>Go to <strong>Authentication &gt; Users</strong>.</li>
            <li>Click <strong>Add User &gt; Create User</strong> with email &amp; password.</li>
            <li>Sign in using the Supabase Auth tab in the Admin Login modal.</li>
          </ol>
        </div>
      </div>

      {/* Supabase Schema & Migration Box */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-burgundy" />
            Production SQL Migration (schema.sql)
          </h3>
          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#702C43] hover:bg-[#5C2336] text-white rounded-xl text-xs font-medium shadow-xs cursor-pointer self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied SQL Script!' : 'Copy SQL Script'}
          </button>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Execute this script in your Supabase SQL Editor to provision the canonical <code className="font-mono">wedding_config</code> table, media storage buckets, and secure Row Level Security policies:
        </p>

        <div className="relative">
          <pre className="p-4 bg-stone-900 text-stone-200 text-xs font-mono rounded-xl overflow-x-auto max-h-72 border border-stone-800">
            {SQL_MIGRATION_SCRIPT}
          </pre>
        </div>
      </div>
    </div>
  );
};
