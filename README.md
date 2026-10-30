# Rahul weds Radhika · राहुल और राधिका
### Modern Haryanvi Bilingual Wedding Website

A mobile-first, bilingual (English & Hindi) digital wedding invitation and celebration platform for **Rahul & Radhika** (Village Dobh, Rohtak, Haryana · 28 November 2026).

---

## 🌸 Key Architecture & Highlights

1. **Light-Pink Wedding Aesthetic & Cultural Flavour**
   - **Color Palette**:
     - Main Background: `#FFF4F6` (lightest blush/rose water)
     - Secondary Background: `#F8E3E9` (soft rose petal)
     - Card Background: `#FFFFFF`
     - Dusty Rose Accent: `#C76B84`
     - Royal Burgundy: `#702C43` (for high-contrast headings and primary actions)
     - Wedding Gold: `#D6AD62` (accents, ampersands, wax seal)
     - Text Primary: `#33252B` (exceeds WCAG 4.5:1 contrast)
     - Text Secondary: `#765F68`
     - Border: `#EBD9DE`
   - Preserves cultural ceremony accents: Haldi yellow (`#E5A93C`), Mehendi green (`#4E7852`), Sangeet rose/gold, and Baraat royal burgundy.

2. **Interactive 3D Wax-Sealed Envelope Intro**
   - Full-screen opening envelope with embossed botanical and traditional Haryanvi motifs (wheat stalks, marigolds, lotus).
   - Metallic gold wax seal with couple monogram (`R & R` / `रा • रा`).
   - Wax crack audio impulse, haptic feedback, 3D rotating flap revealing royal burgundy lining, and sliding letter with falling petals.

3. **Canonical Data Architecture & Supabase Integration**
   - **Single Source of Truth**: All wedding details (couple identity, family elders, ceremony schedule, venues, theme, audio, and contacts) are governed by a canonical, versioned configuration schema.
   - **Dual-Mode Persistence**:
     - **Connected Mode**: When Supabase is configured with an active admin session, changes persist to the cloud `wedding_config` table and sync instantly across all visitor devices.
     - **Local Offline Mode**: In development or offline mode, changes persist to `localStorage` with automated backups and graceful fallback to compiled defaults.
   - **No Silent Failures**: The admin portal provides explicit indicators for cloud vs local mode, displays exact database errors, and prevents incomplete updates from corrupting valid data.

4. **Robust Admin Security & Row Level Security (RLS)**
   - **Supabase Auth**: Administrators sign in via email & password. Database writes are secured at the PostgreSQL layer using Row Level Security (`auth.role() = 'authenticated'`).
   - **Guest Privacy**: Public visitors have read-only access to published configuration, approved memories, and approved wishes.
   - **Public Client Safety**: Only anonymous public keys (`VITE_SUPABASE_ANON_KEY`) are exposed to the browser. Service-role keys are never included in the frontend.

5. **Media Storage Foundation**
   - Direct integration with Supabase Storage buckets (`wedding-media` for hero/portraits/audio, `wedding-memories` for guest photos).
   - Automated file size limits (15 MB for photos, 25 MB for audio) and MIME type validation.
   - Resilient IndexedDB fallback during local development.

6. **Authentic Invitation Downloads & iCalendar (.ics)**
   - High-resolution (1080x1350) canvas card generator producing official wedding cards and personalized cards with guest names.
   - Printable A4 PDF generation (`jsPDF`) for family distribution.
   - Timezone-accurate iCalendar export (`.ics`) with Indian Standard Time (`Asia/Kolkata`) support and pre-configured calendar reminders.

7. **Bilingual English & Hindi Integrity**
   - Complete parity across all ceremony cards, venue directions, and family greetings.
   - Independent language editing ensures modifying English text never overwrites Hindi translations, and vice versa.

---

## 🛠️ Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Supabase Configuration (anon public key only; never use service_role in client code)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Family Admin Development Passkey (offline / local preview only)
VITE_ADMIN_PASSKEY="wedding2026"

# Optional Google Maps API Key
VITE_GOOGLE_MAPS_KEY=""
```

---

## 🗄️ Database Provisioning

To configure a new Supabase project:
1. Open your Supabase Dashboard > **SQL Editor**.
2. Run the migration script in `supabase_canonical_schema.sql`.
3. Under **Authentication > Users**, create an administrator account.
4. Sign in to `/admin` using your admin credentials.

---

## 🚀 Development & Build

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Run TypeScript checks
npm run lint

# Build production bundle
npm run build
```

---

## 💖 Built for Rahul & Radhika
Celebration at Village Dobh, Rohtak, Haryana · 28 November 2026. Ram Ram!
