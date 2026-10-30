import React from 'react';
import { Home, Calendar, MapPin, Camera, FileText, CheckSquare, Shield } from 'lucide-react';
import { NavigationSectionVisibility } from '../types/wedding';

export interface NavItemConfig {
  id: string;
  path: string;
  titleEn: string;
  titleHi: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  showInHeader: boolean;
  showInBottomNav: boolean;
  order: number;
  configKey?: keyof NavigationSectionVisibility;
}

export const CANONICAL_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    path: '/',
    titleEn: 'Home',
    titleHi: 'मुख्य',
    labelKey: 'nav_bottom_home',
    icon: Home,
    showInHeader: true,
    showInBottomNav: true,
    order: 1,
    configKey: 'hero',
  },
  {
    id: 'events',
    path: '/events',
    titleEn: 'Events',
    titleHi: 'समारोह',
    labelKey: 'nav_events',
    icon: Calendar,
    showInHeader: true,
    showInBottomNav: true,
    order: 2,
    configKey: 'events',
  },
  {
    id: 'venues',
    path: '/venues',
    titleEn: 'Venues',
    titleHi: 'स्थान',
    labelKey: 'nav_venue',
    icon: MapPin,
    showInHeader: true,
    showInBottomNav: true,
    order: 3,
    configKey: 'venues',
  },
  {
    id: 'memories',
    path: '/memories',
    titleEn: 'Memories',
    titleHi: 'यादें',
    labelKey: 'nav_bottom_memories',
    icon: Camera,
    showInHeader: true,
    showInBottomNav: true,
    order: 4,
    configKey: 'memories',
  },
  {
    id: 'invitation',
    path: '/invitation',
    titleEn: 'Card',
    titleHi: 'कार्ड',
    labelKey: 'nav_card',
    icon: FileText,
    showInHeader: true,
    showInBottomNav: true,
    order: 5,
    configKey: 'invitation',
  },
];

/**
 * Helper to get visible navigation items filtered by WeddingConfig
 */
export function getVisibleNavItems(
  visibility?: Partial<NavigationSectionVisibility>,
  target: 'header' | 'bottomNav' | 'all' = 'all'
): NavItemConfig[] {
  return CANONICAL_NAV_ITEMS.filter((item) => {
    if (target === 'header' && !item.showInHeader) return false;
    if (target === 'bottomNav' && !item.showInBottomNav) return false;

    if (item.configKey && visibility) {
      if (visibility[item.configKey] === false) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => a.order - b.order);
}
