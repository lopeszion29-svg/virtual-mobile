# Virtual Phone OS

A responsive Android-inspired virtual phone desktop built with React, Vite, TypeScript, Tailwind CSS, Lucide React, and Supabase. Includes account authentication, a virtual app store, home screen, settings, notes, tasks, contacts, calendar, calculator, clock/stopwatch, safe external browser links, and private file uploads.

## Requirements

- Node.js 20 or newer (recommended)
- A Supabase project

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

1. Create a project at https://supabase.com.
2. In the Supabase SQL Editor, run the complete script in `supabase/migrations/001_virtual_phone.sql`.
3. In Supabase Project Settings → API, copy the Project URL and the publishable/anon client key.
4. Copy `.env.example` to `.env` in the project root and fill in:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Only use the public client key in the browser. **Never use a service-role key in `VITE_*` variables.**

5. In Supabase Authentication → URL Configuration, set the Site URL to your local development URL (typically `http://localhost:5173`) and add your deployed website URL to Redirect URLs. Configure email confirmation according to your needs.
6. Restart the Vite server after changing `.env`.

## 3. Run locally

```bash
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

## 4. Production build

```bash
npm run build
npm run preview
```

Deploy to Vercel by importing the repository and setting `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the project's environment variables. Add the production domain to Supabase Auth redirect URLs.

## What is implemented

- Supabase email/password signup, login, persistent sessions, logout, and password reset email flow.
- Per-user `phone_profiles` JSON state with Row Level Security.
- Supabase Realtime subscription to a user's profile row and cloud upserts after edits.
- Persistent app installation state, wallpaper, theme, accent, notes, tasks, contacts, and events.
- Original virtual app marketplace with install/uninstall behavior.
- Functional calculator, notes, tasks, contacts, calendar events, stopwatch, settings, and safe external-link browser.
- Private `user-files` Storage bucket and owner-only upload/download policies.

## Current limitations / honest status

- This is a functional starter implementation, not an Android emulator. The store installs mini-apps built into this web app; it cannot install arbitrary APKs or all Google Play apps.
- Authentication and cloud sync require your Supabase project configuration and the SQL migration. They cannot work before that setup.
- Cross-device state is stored as a JSON document per account. Realtime updates are enabled, but simultaneous edits to different fields can overwrite each other; a normalized per-record model with version-based conflict resolution is recommended before production use.
- File uploads are private. The current Files/Gallery screens show uploads made during the current app session; persistent listing, deletion, and metadata management should be completed before treating them as a full file manager.
- Connected-device inventory and remote session revocation are not implemented in this starter.
- Browser alarms cannot be guaranteed while the browser is closed or the device is asleep.
- Account deletion is not exposed in the UI yet. Add a server-side Edge Function using a protected service-role secret before offering account deletion; never put that secret in client code.
- Username is saved as profile metadata, but login currently uses email. Username login needs a carefully designed server-side lookup flow to avoid account enumeration.

## Project structure

```text
src/
  App.tsx
  main.tsx
  styles.css
  components/
    AuthScreen.tsx
    PhoneDesktop.tsx
  lib/
    supabase.ts
  types/
    index.ts
supabase/
  migrations/
    001_virtual_phone.sql
.env.example
index.html
package.json
vite.config.ts
```

## Security notes

The SQL migration enables Row Level Security on user tables and scopes each row to `auth.uid()`. Storage paths must begin with the authenticated user's UUID. Keep Supabase service-role credentials server-side only. Review storage MIME types and policies against your product requirements before production launch.
