import { supabase, isSupabaseConfigured } from './supabaseClient';
import { indexedDbMedia } from './indexedDbMedia';
import {
  CeremonyAlbum,
  CeremonyAlbumId,
  MemoryMediaItem,
  MemoryStats,
  MemoryUploadPayload,
  ModerationStatus,
} from '../types/memories';
import couplePortraitImg from '../assets/images/couple_sunlit_portrait_1793105307085.jpg';
import venueCourtyardImg from '../assets/images/modern_courtyard_venue_1793105307206.jpg';

export const CEREMONY_ALBUMS: CeremonyAlbum[] = [
  {
    id: 'all',
    name: { en: 'All Memories', hi: 'सभी यादें' },
    dateStr: { en: 'Full Wedding Celebrations', hi: 'संपूर्ण विवाह उत्सव' },
    colorAccent: '#702C43',
    iconName: 'Sparkles',
  },
  {
    id: 'haldi',
    name: { en: 'Haldi Utsav', hi: 'हल्दी उत्सव' },
    dateStr: { en: '27 Nov 2026 · Morning', hi: '27 नवंबर 2026 · प्रातः' },
    colorAccent: '#D97706',
    iconName: 'Sun',
  },
  {
    id: 'mehendi',
    name: { en: 'Mehendi Ceremony', hi: 'मेहंदी रस्म' },
    dateStr: { en: '27 Nov 2026 · Afternoon', hi: '27 नवंबर 2026 · दोपहर' },
    colorAccent: '#059669',
    iconName: 'Flower2',
  },
  {
    id: 'sangeet',
    name: { en: 'Sangeet & Khoria Night', hi: 'संगीत एवं खोड़िया' },
    dateStr: { en: '27 Nov 2026 · Evening', hi: '27 नवंबर 2026 · सायं' },
    colorAccent: '#9333EA',
    iconName: 'Music',
  },
  {
    id: 'baraat_pheras',
    name: { en: 'Baraat, Jaimala & Pheras', hi: 'बारात, जयमाला व फेरे' },
    dateStr: { en: '28 Nov 2026 · Auspicious Muhurat', hi: '28 नवंबर 2026 · शुभ लग्न' },
    colorAccent: '#B91C1C',
    iconName: 'Heart',
  },
  {
    id: 'reception',
    name: { en: 'Royal Reception', hi: 'शाही प्रीतिभोज' },
    dateStr: { en: '29 Nov 2026 · Evening', hi: '29 नवंबर 2026 · सायं' },
    colorAccent: '#D6AD62',
    iconName: 'Crown',
  },
  {
    id: 'portraits',
    name: { en: 'Family & Couple Portraits', hi: 'युगल एवं परिवार' },
    dateStr: { en: 'Blessings from Elders', hi: 'बुज़ुर्गों का आशीर्वाद' },
    colorAccent: '#702C43',
    iconName: 'Users',
  },
];

const LOCAL_STORAGE_MEMORIES_KEY = 'wedding_shared_memories_v4';
export const VALID_GUEST_PASSCODES = ['rohtak2026', 'wedding2026', 'aaiyozaroor', 'dobh2026'];

// Seed authentic celebration memories showcasing ceremonies
const SEED_APPROVED_MEMORIES: MemoryMediaItem[] = [
  {
    id: 'seed-portrait-1',
    ceremonyId: 'portraits',
    mediaType: 'image',
    url: couplePortraitImg,
    caption: 'Rahul & Radhika · Eternal companionship and heartfelt beginnings in Rohtak',
    tags: ['couple', 'portrait', 'blessings', 'traditional'],
    uploaderName: 'Family Archive',
    uploaderSide: 'groom',
    moderationStatus: 'approved',
    createdAt: '2026-10-25T11:00:00+05:30',
    approvedAt: '2026-10-25T11:05:00+05:30',
  },
  {
    id: 'seed-venue-1',
    ceremonyId: 'baraat_pheras',
    mediaType: 'image',
    url: venueCourtyardImg,
    caption: 'Courtyard pavilion decorated with fresh marigolds and brass urlis',
    tags: ['venue', 'rohtak', 'decor', 'marigold'],
    uploaderName: 'Rohtak Mandap Team',
    uploaderSide: 'bride',
    moderationStatus: 'approved',
    createdAt: '2026-10-26T14:30:00+05:30',
    approvedAt: '2026-10-26T14:35:00+05:30',
  },
  {
    id: 'seed-haldi-1',
    ceremonyId: 'haldi',
    mediaType: 'image',
    url: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Haldi utsav · Auspicious yellow marigolds, golden turmeric blessings, and dhol rhythms',
    tags: ['haldi', 'turmeric', 'marigold', 'celebration'],
    uploaderName: 'Aman Dahiya',
    uploaderSide: 'groom',
    moderationStatus: 'approved',
    createdAt: '2026-10-27T10:00:00+05:30',
    approvedAt: '2026-10-27T10:15:00+05:30',
  },
  {
    id: 'seed-mehendi-1',
    ceremonyId: 'mehendi',
    mediaType: 'image',
    url: 'https://images.unsplash.com/photo-1584285418504-0051b3d37704?auto=format&fit=crop&w=1200&q=80',
    caption: 'Intricate bridal henna artwork featuring peacock motifs and hidden initials',
    tags: ['mehendi', 'henna', 'peacock', 'tradition'],
    uploaderName: 'Pooja & Neha',
    uploaderSide: 'bride',
    moderationStatus: 'approved',
    createdAt: '2026-10-27T15:00:00+05:30',
    approvedAt: '2026-10-27T15:20:00+05:30',
  },
  {
    id: 'seed-sangeet-1',
    ceremonyId: 'sangeet',
    mediaType: 'image',
    url: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1200&q=80',
    caption: 'Traditional Khoria folk dance and high-energy Sangeet celebrations under fairy lights',
    tags: ['sangeet', 'khoria', 'dance', 'dhol'],
    uploaderName: 'Vikas Malik',
    uploaderSide: 'groom',
    moderationStatus: 'approved',
    createdAt: '2026-10-27T20:30:00+05:30',
    approvedAt: '2026-10-27T20:45:00+05:30',
  },
  {
    id: 'seed-reception-1',
    ceremonyId: 'reception',
    mediaType: 'image',
    url: 'https://images.unsplash.com/photo-1519225424480-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    caption: 'Grand reception night under golden chandeliers with family and elders',
    tags: ['reception', 'family', 'grandeur', 'celebration'],
    uploaderName: 'Chaudhary Ranbir Dahiya',
    uploaderSide: 'groom',
    moderationStatus: 'approved',
    createdAt: '2026-10-28T19:00:00+05:30',
    approvedAt: '2026-10-28T19:30:00+05:30',
  },
];

function getStoredLocalMemories(): MemoryMediaItem[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_MEMORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MemoryMediaItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return SEED_APPROVED_MEMORIES;
}

function saveStoredLocalMemories(items: MemoryMediaItem[]): void {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_MEMORIES_KEY, JSON.stringify(items));
  } catch {
    // Ignore error
  }
}

/**
 * Public Query: Fetch ONLY approved media for public gallery
 */
export async function fetchApprovedMemories(
  ceremonyId: CeremonyAlbumId = 'all',
  searchQuery = ''
): Promise<{ data: MemoryMediaItem[]; error?: string }> {
  let allItems: MemoryMediaItem[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('memories')
        .select('*')
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (ceremonyId !== 'all') {
        query = query.eq('ceremony_id', ceremonyId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        allItems = data.map((d) => ({
          id: d.id,
          ceremonyId: d.ceremony_id as CeremonyAlbumId,
          mediaType: d.media_type || 'image',
          url: d.url,
          thumbnailUrl: d.thumbnail_url || d.url,
          storagePath: d.storage_path,
          caption: d.caption,
          tags: d.tags || [],
          uploaderName: d.uploader_name || 'Wedding Guest',
          uploaderSide: d.uploader_side,
          moderationStatus: d.moderation_status as ModerationStatus,
          createdAt: d.created_at,
          approvedAt: d.approved_at,
          fileSize: d.file_size,
        }));
      } else {
        // Fallback to local
        allItems = getStoredLocalMemories().filter((m) => m.moderationStatus === 'approved');
      }
    } catch {
      allItems = getStoredLocalMemories().filter((m) => m.moderationStatus === 'approved');
    }
  } else {
    // Local-first mode
    allItems = getStoredLocalMemories().filter((m) => m.moderationStatus === 'approved');
  }

  // Filter by ceremony if local or fallback
  if (ceremonyId !== 'all') {
    allItems = allItems.filter((item) => item.ceremonyId === ceremonyId);
  }

  // Filter by search query if provided
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    allItems = allItems.filter((item) => {
      const matchCaption = item.caption?.toLowerCase().includes(q);
      const matchUploader = item.uploaderName.toLowerCase().includes(q);
      const matchCeremony = item.ceremonyId.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      return matchCaption || matchUploader || matchCeremony || matchTags;
    });
  }

  return { data: allItems };
}

/**
 * Guest Upload: Submits photo/video with pending status awaiting moderation
 */
export async function uploadGuestMemory(
  payload: MemoryUploadPayload
): Promise<{ success: boolean; memory?: MemoryMediaItem; error?: string }> {
  const { file, ceremonyId, caption, uploaderName, uploaderSide, guestPasscode } = payload;

  // 1. Validate Guest Passcode
  const trimmedPasscode = (guestPasscode || '').trim().toLowerCase();
  const isValidPass =
    VALID_GUEST_PASSCODES.includes(trimmedPasscode) ||
    trimmedPasscode === 'rohtak' ||
    trimmedPasscode === 'wedding';

  if (!isValidPass) {
    return {
      success: false,
      error: 'Invalid guest passcode. Please enter "rohtak2026" or verify with the family.',
    };
  }

  // 2. Validate file size (max 15MB)
  if (file.size > 15 * 1024 * 1024) {
    return {
      success: false,
      error: 'File size exceeds 15 MB. Please select a smaller photo or short video.',
    };
  }

  const isVideo = file.type.startsWith('video/');
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

  // 3. Supabase upload if available
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
      const uniqueId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const storagePath = `pending/${ceremonyId}/${uniqueId}.${ext}`;

      // Upload to Storage bucket 'wedding-memories'
      const { error: storageError } = await supabase.storage
        .from('wedding-memories')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) {
        console.warn('Storage bucket upload failed, using fallback:', storageError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('wedding-memories')
        .getPublicUrl(storagePath);

      const fileUrl = publicUrlData?.publicUrl || '';

      // Insert metadata into memories table with status 'pending'
      const { data: insertData, error: dbError } = await supabase
        .from('memories')
        .insert([
          {
            id: uniqueId,
            ceremony_id: ceremonyId,
            media_type: mediaType,
            url: fileUrl,
            storage_path: storagePath,
            caption: caption?.trim() || null,
            uploader_name: uploaderName.trim(),
            uploader_side: uploaderSide || 'friend',
            moderation_status: 'pending', // Strictly pending!
            file_size: file.size,
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      const newRecord: MemoryMediaItem = {
        id: uniqueId,
        ceremonyId,
        mediaType,
        url: fileUrl,
        storagePath,
        caption: caption?.trim(),
        uploaderName: uploaderName.trim(),
        uploaderSide,
        moderationStatus: 'pending',
        createdAt: new Date().toISOString(),
        fileSize: file.size,
      };

      return { success: true, memory: newRecord };
    } catch (err: unknown) {
      console.warn('Supabase cloud upload failed, falling back to local storage:', err);
      // Fallback seamlessly to local indexedDB storage
    }
  }

  // 4. Local-First / Standalone fallback via IndexedDB
  try {
    const memoryId = `local_mem_${Date.now()}`;
    const savedBlob = await indexedDbMedia.saveMedia(
      memoryId,
      file,
      `memory_${ceremonyId}`,
      file.name
    );

    const localRecord: MemoryMediaItem = {
      id: memoryId,
      ceremonyId,
      mediaType,
      url: savedBlob.url,
      caption: caption?.trim(),
      uploaderName: uploaderName.trim(),
      uploaderSide,
      moderationStatus: 'pending', // Awaits admin approval in Admin Dashboard
      createdAt: new Date().toISOString(),
      fileSize: file.size,
      isLocalOnly: true,
    };

    const currentLocal = getStoredLocalMemories();
    saveStoredLocalMemories([localRecord, ...currentLocal]);

    return { success: true, memory: localRecord };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed. Please try again.',
    };
  }
}

/**
 * Admin: Fetch all memories (pending, approved, rejected)
 */
export async function fetchAdminMemories(
  statusFilter?: ModerationStatus | 'all'
): Promise<{ data: MemoryMediaItem[]; stats: MemoryStats; error?: string }> {
  let list: MemoryMediaItem[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('moderation_status', statusFilter);
      }

      const { data, error } = await query;
      if (!error && data) {
        list = data.map((d) => ({
          id: d.id,
          ceremonyId: d.ceremony_id as CeremonyAlbumId,
          mediaType: d.media_type || 'image',
          url: d.url,
          thumbnailUrl: d.thumbnail_url || d.url,
          storagePath: d.storage_path,
          caption: d.caption,
          tags: d.tags || [],
          uploaderName: d.uploader_name || 'Wedding Guest',
          uploaderSide: d.uploader_side,
          moderationStatus: d.moderation_status as ModerationStatus,
          createdAt: d.created_at,
          approvedAt: d.approved_at,
          fileSize: d.file_size,
        }));
      } else {
        list = getStoredLocalMemories();
      }
    } catch {
      list = getStoredLocalMemories();
    }
  } else {
    list = getStoredLocalMemories();
  }

  // Calculate true counts
  const totalApproved = list.filter((m) => m.moderationStatus === 'approved').length;
  const totalPending = list.filter((m) => m.moderationStatus === 'pending').length;
  const totalRejected = list.filter((m) => m.moderationStatus === 'rejected').length;

  const stats: MemoryStats = {
    totalApproved,
    totalPending,
    totalRejected,
    isCloudConnected: Boolean(isSupabaseConfigured),
  };

  if (statusFilter && statusFilter !== 'all') {
    list = list.filter((m) => m.moderationStatus === statusFilter);
  }

  return { data: list, stats };
}

/**
 * Admin: Approve or Reject a memory item
 */
export async function updateMemoryModerationStatus(
  id: string,
  newStatus: ModerationStatus
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const updates: Record<string, unknown> = {
        moderation_status: newStatus,
      };
      if (newStatus === 'approved') {
        updates.approved_at = new Date().toISOString();
      }

      const { error } = await supabase.from('memories').update(updates).eq('id', id);
      if (error) throw error;
    } catch (err: unknown) {
      console.warn('Supabase update failed, updating local copy:', err);
    }
  }

  // Update local
  const current = getStoredLocalMemories();
  const updated = current.map((item) =>
    item.id === id
      ? {
          ...item,
          moderationStatus: newStatus,
          approvedAt: newStatus === 'approved' ? new Date().toISOString() : item.approvedAt,
        }
      : item
  );
  saveStoredLocalMemories(updated);

  return { success: true };
}

/**
 * Admin: Delete a memory item with confirmation
 */
export async function deleteMemoryItem(
  id: string,
  storagePath?: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      if (storagePath) {
        await supabase.storage.from('wedding-memories').remove([storagePath]);
      }
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
    } catch (err: unknown) {
      console.warn('Supabase delete failed:', err);
    }
  }

  // Remove from local IndexedDB if local
  if (id.startsWith('local_mem_')) {
    void indexedDbMedia.deleteMedia(id);
  }

  // Remove from local storage list
  const current = getStoredLocalMemories();
  saveStoredLocalMemories(current.filter((item) => item.id !== id));

  return { success: true };
}

// ==============================================================================
// PHASE 6: SAVED MEMORIES (BOOKMARKS)
// ==============================================================================
const LOCAL_BOOKMARKS_KEY = 'wedding_saved_memories_v1';

export function getSavedMemoryIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleSaveMemory(id: string): { isSaved: boolean; count: number } {
  try {
    const ids = getSavedMemoryIds();
    const exists = ids.includes(id);
    const updated = exists ? ids.filter((i) => i !== id) : [...ids, id];
    window.localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(updated));
    return { isSaved: !exists, count: updated.length };
  } catch {
    return { isSaved: false, count: 0 };
  }
}

export function isMemorySaved(id: string): boolean {
  return getSavedMemoryIds().includes(id);
}

// ==============================================================================
// PHASE 6: 1ST ANNIVERSARY TIME CAPSULE
// ==============================================================================
export const ANNIVERSARY_UNLOCK_ISO = '2027-11-28T00:00:00+05:30';
const LOCAL_TIME_CAPSULE_KEY = 'wedding_time_capsule_messages_v1';

const SEED_TIME_CAPSULE = [
  {
    id: 'capsule-seed-1',
    authorName: 'Aman & Neha Dahiya',
    authorSide: 'groom' as const,
    message: 'Happy 1st Anniversary Rahul & Radhika! May the laughter from the Dobh courtyard stay in your home forever.',
    createdAt: '2026-10-26T12:00:00+05:30',
    unlockDateISO: ANNIVERSARY_UNLOCK_ISO,
    isRevealed: false,
  },
  {
    id: 'capsule-seed-2',
    authorName: 'Col. Virender & Meenakshi Malik',
    authorSide: 'bride' as const,
    message: 'Wishing you endless joy and prosperity. Looking back on the Morbagh Sangeet night with deep affection!',
    createdAt: '2026-10-27T16:00:00+05:30',
    unlockDateISO: ANNIVERSARY_UNLOCK_ISO,
    isRevealed: false,
  },
];

export function isTimeCapsuleUnlocked(): boolean {
  return Date.now() >= new Date(ANNIVERSARY_UNLOCK_ISO).getTime();
}

export async function submitTimeCapsuleMessage(
  authorName: string,
  authorSide: 'groom' | 'bride' | 'friend',
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!authorName.trim() || !message.trim()) {
    return { success: false, error: 'Please enter both your name and anniversary message.' };
  }

  const record = {
    id: `capsule_${Date.now()}`,
    authorName: authorName.trim(),
    authorSide,
    message: message.trim(),
    createdAt: new Date().toISOString(),
    unlockDateISO: ANNIVERSARY_UNLOCK_ISO,
    isRevealed: false,
  };

  // 1. Supabase persistence if available
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('time_capsule').insert([
        {
          id: record.id,
          author_name: record.authorName,
          author_side: record.authorSide,
          message: record.message,
          unlock_date: record.unlockDateISO,
        },
      ]);
      if (error) console.warn('Supabase capsule insert failed:', error.message);
    } catch {
      // Local fallback
    }
  }

  // 2. LocalStorage persistence
  try {
    const raw = window.localStorage.getItem(LOCAL_TIME_CAPSULE_KEY);
    const list = raw ? JSON.parse(raw) : SEED_TIME_CAPSULE;
    list.unshift(record);
    window.localStorage.setItem(LOCAL_TIME_CAPSULE_KEY, JSON.stringify(list));
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Could not save message',
    };
  }
}

export async function fetchTimeCapsuleStatus(): Promise<{
  totalCount: number;
  isUnlocked: boolean;
  unlockDateISO: string;
  messages: Array<{
    id: string;
    authorName: string;
    authorSide: 'groom' | 'bride' | 'friend';
    createdAt: string;
    message?: string;
  }>;
}> {
  const isUnlocked = isTimeCapsuleUnlocked();
  let list = SEED_TIME_CAPSULE;

  try {
    const raw = window.localStorage.getItem(LOCAL_TIME_CAPSULE_KEY);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch {
    // Ignore
  }

  // Enforce privacy: Hide message content if still sealed before 2027 anniversary!
  const sanitized = list.map((item) => ({
    id: item.id,
    authorName: item.authorName,
    authorSide: item.authorSide,
    createdAt: item.createdAt,
    message: isUnlocked ? item.message : undefined,
  }));

  return {
    totalCount: sanitized.length,
    isUnlocked,
    unlockDateISO: ANNIVERSARY_UNLOCK_ISO,
    messages: sanitized,
  };
}

// ==============================================================================
// PHASE 6: CEREMONY QR CODES & DEEP LINKS
// ==============================================================================
export function getCeremonyUploadUrl(ceremonyId: CeremonyAlbumId = 'all'): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  return `${origin}#memories?album=${ceremonyId}&upload=true`;
}

