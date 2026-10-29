import { LocalizedString } from './wedding';

export type CeremonyAlbumId =
  | 'all'
  | 'haldi'
  | 'mehendi'
  | 'sangeet'
  | 'baraat_pheras'
  | 'reception'
  | 'portraits';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface CeremonyAlbum {
  id: CeremonyAlbumId;
  name: LocalizedString;
  dateStr: LocalizedString;
  colorAccent: string;
  iconName: string;
}

export interface MemoryMediaItem {
  id: string;
  ceremonyId: CeremonyAlbumId;
  mediaType: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  caption?: string;
  tags?: string[];
  uploaderName: string;
  uploaderSide?: 'groom' | 'bride' | 'friend';
  moderationStatus: ModerationStatus;
  createdAt: string;
  approvedAt?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  isLocalOnly?: boolean;
}

export interface MemoryUploadPayload {
  file: File;
  ceremonyId: CeremonyAlbumId;
  caption?: string;
  uploaderName: string;
  uploaderSide?: 'groom' | 'bride' | 'friend';
  guestPasscode?: string;
}

export interface MemoryStats {
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  isCloudConnected: boolean;
}

export interface TimeCapsuleMessage {
  id: string;
  authorName: string;
  authorSide: 'groom' | 'bride' | 'friend';
  message: string;
  createdAt: string;
  unlockDateISO: string;
  isRevealed: boolean;
}

