# Rahul weds Radhika · राहुल और राधिका
### Modern Haryanvi Bilingual Wedding Website

A mobile-first, bilingual (English & Hindi) digital wedding invitation and celebration platform for **Rahul & Radhika** (Village Dobh, Rohtak, Haryana · 28 November 2026).

---

## 🌸 Key Highlights & Architecture

1. **Light-Pink Wedding Aesthetic & Modern Haryanvi Flavour**
   - **Color Palette**:
     - Main Background: `#FFF4F6` (lightest blush/rose water)
     - Secondary Background: `#F8E3E9` (soft rose petal)
     - Card Background: `#FFFFFF`
     - Dusty Rose / Accent: `#C76B84`
     - Royal Burgundy: `#702C43` (for high-contrast headings and primary actions)
     - Wedding Gold: `#D6AD62` (accents, ampersands, wax seal)
     - Text Primary: `#33252B` (exceeds WCAG 4.5:1 contrast)
     - Text Secondary: `#765F68`
     - Border: `#EBD9DE`
   - Preserves cultural ceremony accents: Haldi yellow (`#E5A93C`), Mehendi green (`#4E7852`), Sangeet rose/gold, and Baraat royal burgundy.

2. **Interactive 3D Wax-Sealed Envelope Intro**
   - Immersive full-screen luxury envelope with tone-on-tone embossed floral and botanical motifs (wheat stalks, marigolds, lotus, jasmine).
   - Molten metallic gold wax seal with couple monogram (`R & R` / `रा • रा`).
   - Brittle wax crack audio impulse, haptic vibration feedback, 3D rotating flap revealing deep royal burgundy lining, and sliding luxury letter with falling marigold petals.

3. **Robust RSVP System with True State Handling**
   - Four distinct application states: `idle | submitting | confirmed | failed`.
   - **No fake success**: Only stores confirmed status after Supabase successfully accepts the record.
   - **Draft Auto-preservation**: Automatically saves in-progress form inputs in `wedding_rsvp_draft_v3` so guests never lose entered information on accidental refresh or mobile network drops.
   - Graceful error banner with 1-tap "Try Again" retry action.
   - Edit RSVP support with pre-filled previous responses.

4. **Authentic Invitation Downloads (PNG & PDF)**
   - High-resolution (1080x1350) canvas card generator producing crisp official wedding cards or personalized cards with the guest's name.
   - Client-side A4 printable PDF generator (`jsPDF`) formatted for easy printing and sharing on WhatsApp.

5. **Accurate iCalendar (.ics) Schedules & Timezone Support**
   - Explicit `startISO` and `endISO` duration timestamps for every ceremony (Mehendi, Haldi, Sangeet, Baraat & Pheras, Reception).
   - "Happening Today" badge computed using Indian Standard Time (`Asia/Kolkata`), preventing UTC date rollover mismatches for guests in India.
   - Pre-configured 1-day and 2-hour reminder alarms for Google Calendar and Apple Calendar.

6. **Secure Admin Dashboard**
   - Multi-mode authentication:
     - **Family Admin Passkey**: Configured via `VITE_ADMIN_PASSKEY` (defaults to `wedding2026`).
     - **Supabase Auth**: Email and password login for registered family administrators.
   - Live database metrics query (real counts for guests, vegetarian meals, stay, and pickup needs).
   - Full CSV export with Unicode UTF-8 BOM encoding for Excel/Google Sheets compatibility.
   - Admin-controlled custom background music upload (MP3/M4A), volume controls, and playback offset.

---

## 🛠️ Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Supabase Configuration (anon public key only; never use service_role)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Family Admin Passkey (used to unlock /admin dashboard)
VITE_ADMIN_PASSKEY="wedding2026"

# Optional Google Maps API Key (if embedding custom Google Maps)
VITE_GOOGLE_MAPS_KEY=""
```

---

## 🚀 Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript checks
npm run lint

# Build production bundle
npm run build
```

---

## 💖 Made with Love
Built for **Rahul & Radhika** by Rohit. Ram Ram!
