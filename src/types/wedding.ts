/**
 * Comprehensive TypeScript Interfaces for Wedding Configuration & Admin Management
 * Single source of truth for the entire "Rahul Weds Radhika" platform.
 */

export interface LocalizedString {
  en: string;
  hi: string;
}

export interface PersonIdentity {
  en: string;
  hi: string;
  shortName?: string;
  surname?: string;
  introduction?: LocalizedString;
  photoUrl?: string;
  bio?: LocalizedString;
}

export interface FamilyConfig {
  father: LocalizedString;
  mother: LocalizedString;
  grandparents?: LocalizedString;
  village: LocalizedString;
  surname: string;
  blessingMessage?: LocalizedString;
  photoUrl?: string;
}

export interface FamilyMember {
  id: string;
  name: LocalizedString;
  relation: LocalizedString;
  side: 'groom' | 'bride' | 'both';
  honorific?: string;
  photoUrl?: string;
  description?: LocalizedString;
  sortOrder: number;
  visible: boolean;
}

export interface EventConfigItem {
  id: string;
  nameKey?: string; // legacy support
  name: LocalizedString;
  emoji: string;
  dateISO: string;
  startISO: string;
  endISO: string;
  startTime: string;
  endTime: string;
  venueId: string;
  dressCode: LocalizedString;
  colorAccent: string;
  swatches: string[];
  description: LocalizedString;
  visible: boolean;
  sortOrder: number;
  notes?: LocalizedString;
  photoUrl?: string;
}

export interface VenueConfigItem {
  id: string;
  nameKey?: string;
  name: LocalizedString;
  addressKey?: string;
  address: LocalizedString;
  landmarkKey?: string;
  landmark: LocalizedString;
  parkingKey?: string;
  parking: LocalizedString;
  lat: number;
  lng: number;
  plusCode: string;
  mapsUrl: string;
  embedUrl: string;
  image?: string;
  visible: boolean;
  sortOrder: number;
  accessibilityNotes?: LocalizedString;
}

export interface ContactConfigItem {
  id: string;
  role: 'travel' | 'stay' | 'general' | 'food' | 'custom';
  role_label_en: string;
  role_label_hi: string;
  name_en: string;
  name_hi: string;
  phone: string;
  secondaryPhone?: string;
  whatsapp: string;
  email?: string;
  languages: string;
  visible: boolean;
  sortOrder: number;
  description?: LocalizedString;
}

export interface MediaAsset {
  id: string;
  category: 'portrait' | 'couple' | 'venue' | 'invitation' | 'hero' | 'gallery' | 'family';
  title: LocalizedString;
  url: string; // Blob URL or static asset path
  isLocalUpload?: boolean;
  mimeType?: string;
  fileSize?: number;
  updatedAt: string;
  visible: boolean;
}

export interface ScratchRevealConfig {
  enabled: boolean;
  heading: LocalizedString;
  instruction: LocalizedString;
  revealedMessage: LocalizedString;
  revealThresholdPercentage: number;
  scratchColor: string;
  persistRevealedState: boolean;
  allowReplay: boolean;
  animationStyle: 'confetti' | 'sparkle' | 'gentle' | 'none';
}

export interface CountdownConfig {
  visible: boolean;
  title: LocalizedString;
  targetISO: string;
  timezone: string;
  pendingMessage: LocalizedString;
  celebratedMessage: LocalizedString;
  enableScratchCard: boolean;
}

export interface ThemeColors {
  mainBg: string;
  secondaryBg: string;
  cardBg: string;
  accentPink: string;
  burgundy: string;
  gold: string;
  goldDark?: string;
  goldLight?: string;
  textPrimary: string;
  textSecondary: string;
  borderPink: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export interface ThemeConfig {
  activePresetId: string;
  colors: ThemeColors;
  headingFont: string;
  bodyFont: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadowIntensity: 'subtle' | 'medium' | 'dramatic';
  showDecorativeMotifs: boolean;
  floralIntensity: 'minimal' | 'moderate' | 'luxurious';
}

export interface NavigationSectionVisibility {
  hero: boolean;
  countdown: boolean;
  scratchCard: boolean;
  events: boolean;
  venues: boolean;
  invitation: boolean;
  memories: boolean;
  help: boolean;
  floatingAudio: boolean;
  floatingHelp: boolean;
  mobileBottomNav: boolean;
}

export interface SeoAndSharingConfig {
  websiteTitle: LocalizedString;
  pageDescription: LocalizedString;
  ogTitle: LocalizedString;
  ogDescription: LocalizedString;
  whatsappShareText: LocalizedString;
  siteUrl: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
}

export interface AudioSettingsConfig {
  enabled: boolean;
  defaultMuted: boolean;
  trackName: string;
  audioUrl?: string;
  audioPath?: string;
  volume: number;
  loop: boolean;
  startAtSeconds: number;
  label: LocalizedString;
}

export interface DownloadsConfig {
  officialPngTitle: LocalizedString;
  officialPngFilename: string;
  officialPdfTitle: LocalizedString;
  officialPdfFilename: string;
  customCardTitle: LocalizedString;
  showDownloads: boolean;
}

/**
 * Root Complete Wedding Configuration
 */
export interface WeddingConfig {
  version: number;
  lastUpdatedISO: string;

  // Identity & Couple
  groom: PersonIdentity;
  bride: PersonIdentity;
  monogram: LocalizedString;
  weddingDateDisplay: LocalizedString;
  weddingDateISO: string;
  ceremonyStartTime: string;
  ceremonyEndTime: string;
  timezone: string;
  siteBuilder: string;

  // Families
  groomFamily: FamilyConfig;
  brideFamily: FamilyConfig;
  familyMembers: FamilyMember[];
  showFamiliesPublicly: boolean;

  // Events, Venues, Contacts
  events: EventConfigItem[];
  venues: VenueConfigItem[];
  contacts: ContactConfigItem[];

  // Media
  media: {
    couplePortrait: string;
    venueCourtyard: string;
    heroBackdrop?: string;
    invitationArtwork?: string;
    bridePortrait?: string;
    groomPortrait?: string;
    customGallery: MediaAsset[];
  };

  // Countdown & Scratch
  countdown: CountdownConfig;
  scratchReveal: ScratchRevealConfig;

  // Look & Feel
  theme: ThemeConfig;
  navigation: NavigationSectionVisibility;

  // Audio, Downloads, Sharing
  audio: AudioSettingsConfig;
  downloads: DownloadsConfig;
  seo: SeoAndSharingConfig;

  // Content Customization Overrides (Key -> LocalizedString)
  contentOverrides: Record<string, LocalizedString>;
}
