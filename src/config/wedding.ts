import couplePortraitImg from '../assets/images/couple_sunlit_portrait_1793105307085.jpg';
import venueCourtyardImg from '../assets/images/modern_courtyard_venue_1793105307206.jpg';
import {
  WeddingConfig,
  ThemePreset,
  EventConfigItem,
  VenueConfigItem,
  ContactConfigItem,
} from '../types/wedding';

export type { EventConfigItem, VenueConfigItem, ContactConfigItem };

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'blush-burgundy',
    name: 'Blush Pink & Burgundy (Default)',
    description: 'Sophisticated modern Indian aesthetic with royal wine headings and blush backdrops.',
    colors: {
      mainBg: '#FFF4F6',
      secondaryBg: '#F8E3E9',
      cardBg: '#FFFFFF',
      accentPink: '#C76B84',
      burgundy: '#702C43',
      gold: '#D6AD62',
      goldDark: '#B58A38',
      goldLight: '#F4E5BD',
      textPrimary: '#33252B',
      textSecondary: '#765F68',
      borderPink: '#EBD9DE',
      buttonColor: '#702C43',
      buttonTextColor: '#FFFFFF',
    },
  },
  {
    id: 'ivory-gold',
    name: 'Ivory & Antique Gold',
    description: 'Timeless luxury with rich warm cream paper, royal gold detailing, and charcoal typography.',
    colors: {
      mainBg: '#FDFBF7',
      secondaryBg: '#F5EFE6',
      cardBg: '#FFFFFF',
      accentPink: '#B8860B',
      burgundy: '#5A4A32',
      gold: '#C5A059',
      goldDark: '#9C7A32',
      goldLight: '#F7E7C4',
      textPrimary: '#2C2520',
      textSecondary: '#6E6259',
      borderPink: '#E8DFC8',
      buttonColor: '#5A4A32',
      buttonTextColor: '#FFFFFF',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Pink & Gold',
    description: 'Romantic and radiant rose tones with warm golden highlights and deep plum accents.',
    colors: {
      mainBg: '#FFF0F5',
      secondaryBg: '#FCE4EC',
      cardBg: '#FFFFFF',
      accentPink: '#E07A5F',
      burgundy: '#6B2D5C',
      gold: '#D4AF37',
      goldDark: '#AA8822',
      goldLight: '#FBE8A6',
      textPrimary: '#2B2129',
      textSecondary: '#755F6E',
      borderPink: '#F3D2DF',
      buttonColor: '#6B2D5C',
      buttonTextColor: '#FFFFFF',
    },
  },
  {
    id: 'traditional-haldi',
    name: 'Traditional Haldi Sun',
    description: 'Warm auspicious marigold, mustard yellow, and turmeric hues celebrating joyful sunshine.',
    colors: {
      mainBg: '#FFFBEB',
      secondaryBg: '#FEF3C7',
      cardBg: '#FFFFFF',
      accentPink: '#D97706',
      burgundy: '#78350F',
      gold: '#F59E0B',
      goldDark: '#B45309',
      goldLight: '#FDE68A',
      textPrimary: '#382513',
      textSecondary: '#785A3C',
      borderPink: '#FDE68A',
      buttonColor: '#78350F',
      buttonTextColor: '#FFFFFF',
    },
  },
  {
    id: 'mehendi-green',
    name: 'Mehendi Green & Olive',
    description: 'Lush natural olive leaves, eucalyptus pastels, and terracotta ceremonial accents.',
    colors: {
      mainBg: '#F4F7F4',
      secondaryBg: '#E5EDE5',
      cardBg: '#FFFFFF',
      accentPink: '#52796F',
      burgundy: '#2F3E46',
      gold: '#C59B27',
      goldDark: '#997312',
      goldLight: '#E8D49E',
      textPrimary: '#1E2922',
      textSecondary: '#4A5B50',
      borderPink: '#CCDACC',
      buttonColor: '#2F3E46',
      buttonTextColor: '#FFFFFF',
    },
  },
];

/**
 * DEFAULT WEDDING CONFIGURATION
 * Single source of truth for initial state and reset operations.
 */
export const DEFAULT_WEDDING_CONFIG: WeddingConfig = {
  version: 3,
  lastUpdatedISO: '2026-10-28T00:00:00+05:30',

  // Couple Identity
  groom: {
    en: 'Rahul',
    hi: 'राहुल',
    shortName: 'Rahul',
    surname: 'Dahiya',
    introduction: {
      en: 'Son of Smt. & Shri Dahiya, born and raised in Haryana.',
      hi: 'श्रीमती एवं श्री दहिया के सुपुत्र, गाँव डोभ (रोहतक)।',
    },
    photoUrl: couplePortraitImg,
  },
  bride: {
    en: 'Radhika',
    hi: 'राधिका',
    shortName: 'Radhika',
    surname: 'Hooda',
    introduction: {
      en: 'Daughter of Smt. & Shri Hooda, Rohtak, Haryana.',
      hi: 'श्रीमती एवं श्री हुड्डा की सुपुत्री, रोहतक, हरियाणा।',
    },
  },
  monogram: {
    en: 'R & R',
    hi: 'रा • रा',
  },
  weddingDateDisplay: {
    en: '28 November 2026',
    hi: '28 नवंबर 2026',
  },
  weddingDateISO: '2026-11-28T19:30:00+05:30',
  ceremonyStartTime: '06:00 PM',
  ceremonyEndTime: '11:45 PM',
  timezone: 'Asia/Kolkata',
  siteBuilder: 'Rohit',

  // Families
  groomFamily: {
    father: { en: 'Shri Satish Dahiya', hi: 'श्री सतीश दहिया' },
    mother: { en: 'Smt. Kamlesh Dahiya', hi: 'श्रीमती कमलेश दहिया' },
    grandparents: { en: 'Late Chaudhary Raghuvir Singh Dahiya', hi: 'स्व. चौधरी रघुवीर सिंह दहिया' },
    village: { en: 'Village Dobh, Rohtak, Haryana', hi: 'गाँव डोभ, रोहतक, हरियाणा' },
    surname: 'Dahiya',
    blessingMessage: {
      en: 'With the blessings of our ancestors and elders, our home warmly welcomes you.',
      hi: 'बड़ों के मंगल आशीर्वाद से दहिया परिवार आप सभी का हार्दिक स्वागत करता है।',
    },
  },
  brideFamily: {
    father: { en: 'Shri Virender Hooda', hi: 'श्री वीरेंद्र हुड्डा' },
    mother: { en: 'Smt. Anita Hooda', hi: 'श्रीमती अनिता हुड्डा' },
    grandparents: { en: 'Chaudhary Ranbir Singh Hooda', hi: 'चौधरी रणबीर सिंह हुड्डा' },
    village: { en: 'Rohtak, Haryana', hi: 'रोहतक, हरियाणा' },
    surname: 'Hooda',
    blessingMessage: {
      en: 'Joyfully celebrating the wedding of our beloved daughter Radhika with Rahul.',
      hi: 'हमारी प्यारी सुपुत्री राधिका के शुभ विवाह में आप सपरिवार सादर आमंत्रित हैं।',
    },
  },
  familyMembers: [
    {
      id: 'fm-1',
      name: { en: 'Chaudhary Ranbir Dahiya (Tauji)', hi: 'चौधरी रणबीर दहिया (ताऊजी)' },
      relation: { en: 'Paternal Elder / Tauji', hi: 'ताऊजी' },
      side: 'groom',
      honorific: 'Chaudhary',
      sortOrder: 1,
      visible: true,
    },
    {
      id: 'fm-2',
      name: { en: 'Surender Dahiya (Chachaji)', hi: 'सुरेंद्र दहिया (चाचाजी)' },
      relation: { en: 'Chachaji / Catering Head', hi: 'चाचाजी' },
      side: 'groom',
      sortOrder: 2,
      visible: true,
    },
    {
      id: 'fm-3',
      name: { en: 'Deepak Hooda (Mama ji)', hi: 'दीपक हुड्डा (मामाजी)' },
      relation: { en: 'Maternal Uncle / Bhat Inviter', hi: 'मामाजी' },
      side: 'bride',
      sortOrder: 3,
      visible: true,
    },
  ],
  showFamiliesPublicly: true,

  // Events
  events: [
    {
      id: 'mehendi',
      name: { en: 'Mehendi & Bhat', hi: 'मेहंदी एवं भात न्योता' },
      emoji: '🌿',
      dateISO: '2026-11-27T11:00:00+05:30',
      startISO: '2026-11-27T11:00:00+05:30',
      endISO: '2026-11-27T14:30:00+05:30',
      startTime: '11:00 AM',
      endTime: '02:30 PM',
      venueId: 'ancestral_home',
      dressCode: {
        en: 'Floral prints, shades of green & mehendi pastels',
        hi: 'हरे व मेहंदी रंग के परिधान, आरामदायक कुर्ते',
      },
      colorAccent: '#4E7852',
      swatches: ['#4E7852', '#7D9B58', '#EAE6D6'],
      description: {
        en: 'Intricate mehendi application, folk music, maternal bhat rituals and sweet dahi-jalebi in the village courtyard.',
        hi: 'पैतृक आंगन में मेहंदी, ननिहाल पक्ष का भात न्योता और ताज़ा जलेबी व कुल्हड़ चाय की मिठास।',
      },
      visible: true,
      sortOrder: 1,
    },
    {
      id: 'haldi',
      name: { en: 'Haldi & Khoria Geet', hi: 'हल्दी एवं खोरिया लोकगीत' },
      emoji: '🌼',
      dateISO: '2026-11-27T16:30:00+05:30',
      startISO: '2026-11-27T16:30:00+05:30',
      endISO: '2026-11-27T20:00:00+05:30',
      startTime: '04:30 PM',
      endTime: '08:00 PM',
      venueId: 'ancestral_home',
      dressCode: {
        en: 'Bright yellow, mustard & sunny ivory',
        hi: 'सरसों पीला, हल्दी रंग या क्रीम कुर्ता',
      },
      colorAccent: '#E5A93C',
      swatches: ['#F9E3A8', '#E5A93C', '#C98522'],
      description: {
        en: 'Auspicious turmeric ceremony, marigold showers, traditional Haryanvi Khoria folk songs, and evening chai.',
        hi: 'गेंदे की पंखुड़ियों के बीच हल्दी का शगुन, हरियाणवी खोरिया लोकगीत और शाम की चाय पर हँसी-ठिठोली।',
      },
      visible: true,
      sortOrder: 2,
    },
    {
      id: 'sangeet',
      name: { en: 'Sangeet & DJ Night', hi: 'संगीत एवं डीजे नाइट' },
      emoji: '🥁',
      dateISO: '2026-11-27T19:30:00+05:30',
      startISO: '2026-11-27T19:30:00+05:30',
      endISO: '2026-11-27T23:30:00+05:30',
      startTime: '07:30 PM',
      endTime: '11:30 PM',
      venueId: 'morbagh_pavilion',
      dressCode: {
        en: 'Indo-western festive, comfortable dancing footwear',
        hi: 'चमकीले उत्सव परिधान, नाचने योग्य जूते-जूतियां',
      },
      colorAccent: '#C76B84',
      swatches: ['#C76B84', '#702C43', '#D6AD62'],
      description: {
        en: 'High-energy dhol beats, family dance performances, DJ night, and live street-food counters.',
        hi: 'ढोल की गूँज पर दोनों परिवारों का धमाकेदार डांस, डीजे संगीत और गरमा-गरम खान-पान।',
      },
      visible: true,
      sortOrder: 3,
    },
    {
      id: 'baraat_pheras',
      name: { en: 'Baraat, Jaimala & Pheras', hi: 'शुभ बारात, जयमाला एवं फेरे' },
      emoji: '🔥',
      dateISO: '2026-11-28T18:00:00+05:30',
      startISO: '2026-11-28T18:00:00+05:30',
      endISO: '2026-11-28T23:45:00+05:30',
      startTime: '06:00 PM',
      endTime: '11:45 PM',
      venueId: 'morbagh_pavilion',
      dressCode: {
        en: 'Traditional festive wear & warm winter shawls',
        hi: 'पारंपरिक साफ़ा, शेरवानी, लहंगा और गर्म शॉल',
      },
      colorAccent: '#702C43',
      swatches: ['#702C43', '#D6AD62', '#FFF4F6'],
      description: {
        en: 'Safa tying, royal baraat entry, jaimala under twinkling chandeliers, grand wedding feast and sacred seven pheras.',
        hi: 'साफ़ा बंधाई, गाजे-बाजे से बारात अगवानी, भव्य जयमाला, प्रीतिभोज और अग्नि के समक्ष सात पावन फेरे।',
      },
      visible: true,
      sortOrder: 4,
    },
    {
      id: 'reception',
      name: { en: 'Community Preetibhoj & Reception', hi: 'प्रीतिभोज एवं आशीर्वाद' },
      emoji: '✨',
      dateISO: '2026-11-29T12:00:00+05:30',
      startISO: '2026-11-29T12:00:00+05:30',
      endISO: '2026-11-29T16:00:00+05:30',
      startTime: '12:00 PM',
      endTime: '04:00 PM',
      venueId: 'morbagh_pavilion',
      dressCode: {
        en: 'Classic elegant formals or festive silks',
        hi: 'सभ्य औपचारिक या रेशमी उत्सव परिधान',
      },
      colorAccent: '#D6AD62',
      swatches: ['#D6AD62', '#702C43', '#F8E3E9'],
      description: {
        en: 'Welcoming the newlyweds, heartfelt blessings from elders, photo memories, and traditional community lunch.',
        hi: 'नवदंपति का स्नेहिल स्वागत, बड़ों का मंगल आशीर्वाद और सुरुचिपूर्ण दोपहर का प्रीतिभोज।',
      },
      visible: true,
      sortOrder: 5,
    },
  ],

  // Venues
  venues: [
    {
      id: 'morbagh_pavilion',
      name: { en: 'Morbagh Courtyard Pavilion', hi: 'मोरबाग़ कोर्टयार्ड मंडप' },
      address: {
        en: 'NH-9 Bypass, Near Delhi-Rohtak Expressway, Rohtak, Haryana 124001',
        hi: 'एनएच-9 बाईपास, दिल्ली-रोहतक एक्सप्रेसवे के पास, रोहतक, हरियाणा 124001',
      },
      landmark: {
        en: 'Adjacent to Green Meadows Resort',
        hi: 'ग्रीन मीडोज रिजॉर्ट के समीप',
      },
      parking: {
        en: 'Valet parking available for 250+ cars inside the venue gate.',
        hi: 'मंडप परिसर के भीतर 250+ गाड़ियों हेतु वैले पार्किंग उपलब्ध।',
      },
      lat: 28.8955,
      lng: 76.6066,
      plusCode: 'VJV4+6J Rohtak, Haryana',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=28.8955,76.6066',
      embedUrl: 'https://maps.google.com/maps?q=28.8955,76.6066&hl=en&z=15&output=embed',
      image: venueCourtyardImg,
      visible: true,
      sortOrder: 1,
    },
    {
      id: 'ancestral_home',
      name: { en: 'Dahiya Ancestral Village Courtyard', hi: 'दहिया पैतृक निवास एवं चौपाल' },
      address: {
        en: 'Main Chopal, Village Dobh, District Rohtak, Haryana 124021',
        hi: 'मुख्य चौपाल, गाँव डोभ, जिला रोहतक, हरियाणा 124021',
      },
      landmark: {
        en: 'Near Village Shiv Mandir and Community Well',
        hi: 'गाँव के शिव मंदिर एवं चौपाल के पास',
      },
      parking: {
        en: 'Designated guest parking at the Government School ground, 100m away.',
        hi: 'गाँव के सरकारी स्कूल प्रांगण में विशेष पार्किंग (100 मीटर दूरी)।',
      },
      lat: 28.8672,
      lng: 76.6541,
      plusCode: 'VM83+VJ Dobh, Haryana',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=28.8672,76.6541',
      embedUrl: 'https://maps.google.com/maps?q=28.8672,76.6541&hl=en&z=15&output=embed',
      visible: true,
      sortOrder: 2,
    },
  ],

  // Contacts
  contacts: [
    {
      id: 'contact_travel',
      role: 'travel',
      role_label_en: 'Travel, Pickup & Route Assistance',
      role_label_hi: 'रास्ता, पिकअप एवं वाहन सहायता',
      name_en: 'Aman Dahiya & Vikas Malik',
      name_hi: 'अमन दहिया एवं विकास मलिक',
      phone: '+919416088210',
      whatsapp: '919416088210',
      languages: 'Hindi / Haryanvi / English',
      visible: true,
      sortOrder: 1,
    },
    {
      id: 'contact_stay',
      role: 'stay',
      role_label_en: 'Stay, Rooms & Guest Accommodations',
      role_label_hi: 'ठहरने व कमरों की व्यवस्था',
      name_en: 'Deepak Hooda & Sandeep Dahiya',
      name_hi: 'दीपक हुड्डा एवं संदीप दहिया',
      phone: '+919812045108',
      whatsapp: '919812045108',
      languages: 'Hindi / English',
      visible: true,
      sortOrder: 2,
    },
    {
      id: 'contact_general',
      role: 'general',
      role_label_en: 'Family Elder & Head of Hospitality',
      role_label_hi: 'परिवार के मुखिया · स्वागताकांक्षी',
      name_en: 'Chaudhary Ranbir Dahiya (Tauji)',
      name_hi: 'चौधरी रणबीर दहिया (ताऊजी)',
      phone: '+919896273419',
      whatsapp: '919896273419',
      languages: 'Haryanvi / Hindi',
      visible: true,
      sortOrder: 3,
    },
    {
      id: 'contact_food',
      role: 'food',
      role_label_en: 'Bhojan & Catering Coordination',
      role_label_hi: 'भोजन एवं जलपान व्यवस्था',
      name_en: 'Surender Dahiya (Chachaji)',
      name_hi: 'सुरेंद्र दहिया (चाचाजी)',
      phone: '+919812398765',
      whatsapp: '919812398765',
      languages: 'Hindi / Haryanvi',
      visible: true,
      sortOrder: 4,
    },
  ],

  // Media
  media: {
    couplePortrait: couplePortraitImg,
    venueCourtyard: venueCourtyardImg,
    customGallery: [],
  },

  // Countdown & Scratch Reveal
  countdown: {
    visible: true,
    title: { en: 'Countdown to the Big Day', hi: 'विवाह शुभ घड़ी की उल्टी गिनती' },
    targetISO: '2026-11-28T19:30:00+05:30',
    timezone: 'Asia/Kolkata',
    pendingMessage: { en: 'Ceremony date is approaching!', hi: 'शुभ घड़ी जल्द ही आ रही है!' },
    celebratedMessage: { en: 'The wedding celebration is underway!', hi: 'विवाह उत्सव आनंदपूर्वक संपन्न हो रहा है!' },
    enableScratchCard: true,
  },
  scratchReveal: {
    enabled: true,
    heading: { en: 'Scratch to Reveal the Sacred Date', hi: 'शुभ विवाह तिथि जानने हेतु स्क्रैच करें' },
    instruction: { en: 'Rub your finger or mouse across the gold card', hi: 'सुनहरे कार्ड पर उंगली या माउस फिराएं' },
    revealedMessage: { en: '28 November 2026 · Rohtak, Haryana', hi: '28 नवंबर 2026 · रोहतक, हरियाणा' },
    revealThresholdPercentage: 45,
    scratchColor: '#D6AD62',
    persistRevealedState: true,
    allowReplay: true,
    animationStyle: 'confetti',
  },

  // Theme & Navigation
  theme: {
    activePresetId: 'blush-burgundy',
    colors: THEME_PRESETS[0].colors,
    headingFont: 'Fraunces',
    bodyFont: 'Inter',
    borderRadius: 'xl',
    shadowIntensity: 'medium',
    showDecorativeMotifs: true,
    floralIntensity: 'moderate',
  },
  navigation: {
    hero: true,
    countdown: true,
    scratchCard: true,
    events: true,
    venues: true,
    invitation: true,
    memories: true,
    help: true,
    floatingAudio: true,
    floatingHelp: true,
    mobileBottomNav: true,
  },

  // Audio
  audio: {
    enabled: true,
    defaultMuted: false,
    trackName: 'Traditional Shehnai & Dhol Festive Tune',
    volume: 0.7,
    loop: true,
    startAtSeconds: 0,
    label: { en: 'Traditional Wedding Music', hi: 'पारंपरिक शहनाई एवं ढोल धुन' },
  },

  // Downloads
  downloads: {
    officialPngTitle: { en: 'Official Wedding Card', hi: 'आधिकारिक विवाह पत्रिका' },
    officialPngFilename: 'rahul-radhika-official-wedding-card.png',
    officialPdfTitle: { en: 'Printable Wedding Invitation', hi: 'मुद्रण योग्य निमंत्रण पत्र' },
    officialPdfFilename: 'rahul-radhika-invitation.pdf',
    customCardTitle: { en: 'Personalized Card Generator', hi: 'व्यक्तिगत निमंत्रण कार्ड' },
    showDownloads: true,
  },

  // SEO & Social
  seo: {
    websiteTitle: {
      en: 'Rahul weds Radhika · राहुल और राधिका | Wedding Celebration',
      hi: 'राहुल और राधिका का शुभ विवाह | 28 नवंबर 2026',
    },
    pageDescription: {
      en: 'Ram Ram! Join us in celebrating the wedding of Rahul & Radhika in Rohtak, Haryana on 28 November 2026. Aaiyo Zaroor! Schedule, maps, RSVP & invitation card.',
      hi: 'राम राम! राहुल और राधिका के शुभ विवाह (28 नवंबर 2026, रोहतक, हरियाणा) में आप सपरिवार सादर आमंत्रित हैं। आइयो ज़रूर!',
    },
    ogTitle: {
      en: 'Rahul weds Radhika · राहुल और राधिका',
      hi: 'राहुल और राधिका का शुभ विवाह',
    },
    ogDescription: {
      en: '28 November 2026 · Village Dobh, Rohtak, Haryana. Ram Ram! Aaiyo Zaroor!',
      hi: '28 नवंबर 2026 · गाँव डोभ, रोहतक, हरियाणा। राम राम! आइयो ज़रूर!',
    },
    whatsappShareText: {
      en: 'Ram Ram! You and your family are warmly invited to the wedding of Rahul & Radhika on 28 November 2026 in Rohtak, Haryana. Aaiyo Zaroor! Details, schedule & RSVP:',
      hi: 'राम राम! बड़े-बुज़ुर्गों के आशीर्वाद से राहुल और राधिका के शुभ विवाह (28 नवंबर 2026, रोहतक, हरियाणा) में आप सपरिवार सादर आमंत्रित हैं। आइयो ज़रूर! पूरा कार्यक्रम और रास्ता देखें:',
    },
    siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://rahulweddsradhika.in',
  },

  contentOverrides: {},
};

/**
 * Backward compatibility proxy for existing imports
 */
export const WEDDING_CONFIG: WeddingConfig & {
  weddingDate: string;
  village: { en: string; hi: string };
  whatsappShareText: { en: string; hi: string };
  siteUrl: string;
  coupleImages: { hero: string; story: string; portrait: string };
} = {
  ...DEFAULT_WEDDING_CONFIG,
  weddingDate: DEFAULT_WEDDING_CONFIG.weddingDateDisplay.en,
  village: DEFAULT_WEDDING_CONFIG.groomFamily.village,
  whatsappShareText: DEFAULT_WEDDING_CONFIG.seo.whatsappShareText,
  siteUrl: DEFAULT_WEDDING_CONFIG.seo.siteUrl,
  coupleImages: {
    hero: DEFAULT_WEDDING_CONFIG.media.couplePortrait,
    story: DEFAULT_WEDDING_CONFIG.media.couplePortrait,
    portrait: DEFAULT_WEDDING_CONFIG.media.couplePortrait,
  },
};
