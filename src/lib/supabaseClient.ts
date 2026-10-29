import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Public client-only Supabase initialization.
 * Reads only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * Never uses service_role key in client code.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true },
    })
  : null;

export interface RsvpRecord {
  id?: string;
  created_at?: string;
  full_name: string;
  phone?: string | null;
  attending: 'yes' | 'no' | 'maybe';
  guest_count: number;
  events: string[];
  side?: 'groom' | 'bride' | 'both';
  diet?: 'veg' | 'non-veg' | 'jain' | 'none';
  needs_stay: boolean;
  needs_pickup: boolean;
  arrival_info?: string | null;
  message?: string | null;
  lang: 'en' | 'hi';
}

export interface WishRecord {
  id: string;
  created_at: string;
  name: string;
  message: string;
  approved: boolean;
}

export interface SongRequestRecord {
  id?: string;
  name: string;
  song: string;
  artist?: string;
  created_at?: string;
}

export interface ContactRecord {
  id: string;
  sort_order: number;
  role: 'travel' | 'stay' | 'general' | 'food';
  role_label_en: string;
  role_label_hi: string;
  name_en: string;
  name_hi?: string;
  phone: string;
  whatsapp?: string;
  languages: string;
  active: boolean;
}

// Local storage keys
const LOCAL_CONFIRMED_RSVP_KEY = 'wedding_rsvp_confirmed_v3';
const LOCAL_DRAFT_RSVP_KEY = 'wedding_rsvp_draft_v3';
const LOCAL_WISHES_KEY = 'wedding_cached_wishes_v3';
const LOCAL_SONGS_KEY = 'wedding_my_songs_v3';

const SEED_APPROVED_WISHES: WishRecord[] = [
  {
    id: 'wish-1',
    created_at: '2026-10-24T10:15:00+05:30',
    name: 'डॉ. महेंद्र सिंह सांगवान एवं परिवार',
    message: 'राम राम! राहुल और राधिका की जोड़ी हमेशा खुशहाल रहे। पूरे परिवार का खूब सारा आशीर्वाद!',
    approved: true,
  },
  {
    id: 'wish-2',
    created_at: '2026-10-25T14:30:00+05:30',
    name: 'Col. Virender & Meenakshi Malik',
    message: 'Heartiest congratulations to both families! Looking forward to the Khoria geet and celebrations in Rohtak.',
    approved: true,
  },
  {
    id: 'wish-3',
    created_at: '2026-10-26T09:20:00+05:30',
    name: 'सुमित्रा बुआजी एवं परिवार (सोनीपत)',
    message: 'बच्चों को ढेरों दुआएँ। 27 नवंबर की सुबह ही भात और लगन के लिए सपरिवार पहुँच रहे हैं!',
    approved: true,
  },
];

/**
 * Save draft input so users never lose entered details on accident or network drops
 */
export function saveRsvpDraft(data: Partial<RsvpRecord>): void {
  try {
    window.localStorage.setItem(LOCAL_DRAFT_RSVP_KEY, JSON.stringify(data));
  } catch {
    // Ignore local storage error
  }
}

export function getRsvpDraft(): Partial<RsvpRecord> | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_RSVP_KEY);
    return raw ? (JSON.parse(raw) as Partial<RsvpRecord>) : null;
  } catch {
    return null;
  }
}

export function clearRsvpDraft(): void {
  try {
    window.localStorage.removeItem(LOCAL_DRAFT_RSVP_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Submits RSVP to Supabase.
 * Only caches as confirmed if remote write succeeds or if explicitly operating in offline mode.
 */
export async function submitRsvpToSupabase(
  data: RsvpRecord
): Promise<{ success: boolean; isLocalOnly?: boolean; error?: string }> {
  // Always preserve draft in case of failure
  saveRsvpDraft(data);

  if (!supabase) {
    // Standalone / client-only mode without Supabase connection
    try {
      window.localStorage.setItem(LOCAL_CONFIRMED_RSVP_KEY, JSON.stringify(data));
      clearRsvpDraft();
    } catch {
      // Ignore
    }
    return { success: true, isLocalOnly: true };
  }

  try {
    const { error } = await supabase.from('rsvps').insert([
      {
        full_name: data.full_name.trim(),
        phone: data.phone?.trim() || null,
        attending: data.attending,
        guest_count: data.attending === 'yes' ? data.guest_count : 1,
        events: data.events,
        side: data.side || 'groom',
        diet: data.diet || 'veg',
        needs_stay: data.needs_stay,
        needs_pickup: data.needs_pickup,
        arrival_info: data.arrival_info?.trim() || null,
        message: data.message?.trim() || null,
        lang: data.lang,
      },
    ]);

    if (error) {
      return { success: false, error: error.message };
    }

    // Successfully saved to Supabase: save confirmed locally
    try {
      window.localStorage.setItem(LOCAL_CONFIRMED_RSVP_KEY, JSON.stringify(data));
      clearRsvpDraft();
    } catch {
      // Ignore
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network connection failed. Please check internet and retry.',
    };
  }
}

export function getCachedRsvp(): RsvpRecord | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_CONFIRMED_RSVP_KEY);
    if (raw) return JSON.parse(raw) as RsvpRecord;
    // Backwards compatibility with v2 key
    const v2 = window.localStorage.getItem('wedding_my_rsvp_v2');
    return v2 ? (JSON.parse(v2) as RsvpRecord) : null;
  } catch {
    return null;
  }
}

export function clearCachedRsvp(): void {
  try {
    window.localStorage.removeItem(LOCAL_CONFIRMED_RSVP_KEY);
    window.localStorage.removeItem('wedding_my_rsvp_v2');
  } catch {
    // Ignore
  }
}

/**
 * Fetch all RSVPs for admin dashboard and CSV export
 */
export async function fetchAdminRsvps(): Promise<{ data: RsvpRecord[]; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }
      return { data: (data as RsvpRecord[]) || [] };
    } catch (err: unknown) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to query database',
      };
    }
  }

  // Fallback to local cached RSVP if any
  const cached = getCachedRsvp();
  return { data: cached ? [cached] : [] };
}

export async function fetchApprovedWishes(): Promise<WishRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('id, name, message, created_at, approved')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        return data as WishRecord[];
      }
    } catch {
      // Offline fallback
    }
  }

  try {
    const local = window.localStorage.getItem(LOCAL_WISHES_KEY);
    if (local) {
      const parsed = JSON.parse(local) as WishRecord[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }

  return SEED_APPROVED_WISHES;
}

export async function submitWishToSupabase(
  name: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('wishes').insert([
        {
          name: name.trim(),
          message: message.trim(),
          approved: false, // Moderated by family
        },
      ]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Error' };
    }
  }

  // Local storage preview
  try {
    const existing = await fetchApprovedWishes();
    const updated = [
      {
        id: `local-${Date.now()}`,
        name: name.trim(),
        message: message.trim(),
        created_at: new Date().toISOString(),
        approved: true,
      },
      ...existing,
    ];
    window.localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch {
    // Ignore
  }

  return { success: true };
}

export async function submitSongRequestToSupabase(
  name: string,
  song: string,
  artist?: string
): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('song_requests').insert([
        {
          name: name.trim(),
          song: song.trim(),
          artist: artist?.trim() || null,
        },
      ]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Error' };
    }
  }

  try {
    const local = window.localStorage.getItem(LOCAL_SONGS_KEY);
    const list = local ? (JSON.parse(local) as unknown[]) : [];
    list.unshift({ name, song, artist, created_at: new Date().toISOString() });
    window.localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    // Ignore
  }

  return { success: true };
}
