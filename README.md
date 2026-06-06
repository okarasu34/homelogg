# HomeLog 🏠

**Boligens digitale hukommelse** — Your home's digital memory.

A mobile-first home management app built with Expo (React Native), running on iOS, Android, and Web.

---

## Features

- 🏠 **Home Dashboard** — HomeScore, property overview, recent activity
- ⚡ **Energy Card** — Energy class (A–G), monthly bills, AMS live data
- ✨ **Smart Import** — Scan receipts with AI, connect email/bank/smart meter
- 🔧 **Devices** — Warranty tracking, fault detection
- 📋 **Documents** — Document vault with completion tracking
- 🔨 **Repair Marketplace** — Find verified technicians when something breaks
- 🏷️ **Sell Mode** — QR code for buyers, share full property report
- 🌍 **Bilingual** — Norwegian (default) + English

---

## Tech Stack

- **Expo** (SDK 51) — iOS, Android, Web from one codebase
- **Expo Router** — File-based navigation
- **Supabase** — Database, Auth, Storage
- **OpenAI GPT-4o Vision** — AI document scanning
- **TypeScript** — Full type safety

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/homelog.git
cd homelog
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your keys:
- `EXPO_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `EXPO_PUBLIC_OPENAI_API_KEY` — from OpenAI dashboard

### 3. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Enable Email Auth in Authentication settings

### 4. Run

```bash
# Web
npm run web

# iOS (requires Mac + Xcode)
npm run ios

# Android (requires Android Studio)
npm run android
```

---

## Project Structure

```
homelog/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab screens
│   │   ├── index.tsx      # Home dashboard
│   │   ├── energy.tsx     # Energy card
│   │   ├── import.tsx     # Smart import
│   │   ├── devices.tsx    # Devices
│   │   └── sell.tsx       # Sell mode
│   ├── scan.tsx           # Camera scan
│   ├── scan-result.tsx    # AI scan result
│   ├── repair.tsx         # Repair marketplace
│   ├── repair-detail.tsx  # Firm detail + booking
│   ├── maintenance.tsx    # Maintenance history
│   ├── documents.tsx      # Document vault
│   └── settings.tsx       # Settings + language
├── src/
│   ├── constants/
│   │   ├── theme.ts       # Colors, spacing, shadows
│   │   └── translations.ts # NO + EN translations
│   ├── components/
│   │   └── UI.tsx         # Shared components
│   └── lib/
│       ├── LangContext.tsx # Language state
│       ├── supabase.ts    # Supabase client + types
│       └── openai.ts      # Vision API helper
├── supabase-schema.sql    # Database schema
└── .env.example           # Environment template
```

---

## Roadmap

- [ ] Real Supabase auth (login/signup screens)
- [ ] Real OpenAI Vision integration
- [ ] Kartverket API (Norwegian property registry)
- [ ] Elhub/AMS smart meter integration
- [ ] BankID / Open Banking
- [ ] Push notifications for warranty alerts
- [ ] App Store + Google Play release

---

## License

MIT
