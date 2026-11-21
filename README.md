# 🎮 UGG (UEMK GAMERZ GUILD)

The official high-performance web platform for **UGG (UEMK GAMERZ GUILD)**, the premier collegiate gaming and esports society of the **University of Engineering & Management, Kolkata**.

Built on **Next.js 16 App Router**, **Supabase (PostgreSQL with Row Level Security & Object Storage)**, and deployed on **Vercel's Global Edge Network**.

---

## 🚀 Key Architectural Features

- **⚡ Zero-DB Edge Serving (On-Demand ISR):** Public visitor requests hitting `/` are served in sub-20ms directly from Vercel Edge Cache with zero database queries. Statically pre-rendered with on-demand invalidation (`revalidatePath('/')`) on admin updates.
- **🛡️ Server-Rendered Admin Auth Guard:** `/admin` is dynamically server-rendered per request (`force-dynamic`). Rejects unauthorized requests before rendering any coordinator data. Enforces HttpOnly session cookies + Supabase Auth role verification (`app_metadata.role === 'admin'`).
- **🖼️ Hardened Object Storage for Posters:** Direct file uploads to Supabase Storage bucket `posters` with 4MB file size limit (matching Vercel serverless body constraints), binary magic byte verification (rejecting non-image polyglots), and exact hostname allowlists (project Supabase storage CDN, `images.unsplash.com`).
- **🔒 Defense-in-Depth Write Security:** Every write endpoint (`POST`, `PUT`, `PATCH`, `DELETE`, `UPLOAD`) verifies active admin session with `app_metadata.role === 'admin'`, validates input via Zod, writes to immutable audit log table `admin_audit_logs`, and invalidates edge cache.
- **📱 Accessibility & Reduced Motion:** Touch-friendly 44px minimum tap targets across all interactive elements, keyboard accessibility, visible focus rings, and full `prefers-reduced-motion` compliance across carousels, timers, and animations.
- **📊 Observability & Reliability:** Dedicated `/api/health` heartbeat route with live database ping, and `@vercel/analytics` Real User Monitoring (RUM).

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.3.6 (App Router, Webpack build, On-Demand ISR)
- **Database & Auth:** Supabase (PostgreSQL with RLS, Storage Buckets, GoTrue Auth)
- **Rate Limiting:** Upstash Redis REST support with in-memory sliding window fallback
- **Styling:** Tailwind CSS v4 (Pure dark theme `#060709`, neon crimson accent `#ff1e38`)
- **Validation:** Zod 3.24
- **Testing:** Playwright (E2E), Node.js native test runner (Unit), Autocannon (Load Benchmarking)
- **Deployment:** Vercel Global Edge Network

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js 20.x or 22.x+
- npm 10.x+

### 2. Clone & Branch
```bash
git clone https://github.com/SoumyadeepXD/UGG_UEM-GAMERZ-GUILD.git
cd UGG_UEM-GAMERZ-GUILD
git checkout build-complete
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials (see below for Supabase setup). Note: Never commit `.env.local` or print secrets.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Supabase Development Setup Guide

Follow these steps in your Supabase project:

### Step 1: Execute Schema & Storage Migration
1. Go to your Supabase Project Dashboard -> **SQL Editor**.
2. Open `supabase/schema.sql` from this repository.
3. Paste and run the entire script. This will:
   - Create `public.tournaments` and `public.admin_audit_logs` tables.
   - Attach automatic `handle_updated_at` triggers.
   - Enable Row Level Security (RLS) on all tables.
   - Set public read-only access for published tournaments.
   - Restrict tournament writes and audit log reads strictly to authenticated users with `app_metadata.role = 'admin'`.
   - Create the `posters` storage bucket with 4MB limits and image MIME restrictions.

### Step 2: Seed Initial Tournaments (Optional CLI Step)
Run the manual seed script using your dev project credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
npm run seed
```

### Step 3: Disable Public Signups (Critical Security Step)
1. Go to **Authentication -> Providers -> Email**.
2. **Turn OFF "Enable Signups"**. This prevents arbitrary users from registering accounts.
3. **Turn ON "Confirm email"**.

### Step 4: Provision Admin User
1. Go to **Authentication -> Users -> "Invite User"**.
2. Enter the admin email.
3. Complete the email confirmation link.
4. In the Supabase SQL Editor, grant the admin app metadata:
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
   where email = 'your-admin-email@example.com';
   ```

---

## 🚀 Vercel Deployment & Preview Environments

### 1. Link Repository in Vercel
1. Log in to [vercel.com](https://vercel.com) and click **Add New -> Project**.
2. Import the `UGG_UEM-GAMERZ-GUILD` repository.
3. Set the Framework Preset to **Next.js**.

### 2. Configure Environment Variables on Vercel
Under **Project Settings -> Environment Variables**, configure for **Production** and **Preview**:
- `NEXT_PUBLIC_SITE_URL`: `https://ugg.vercel.app` (or custom domain)
- `NEXT_PUBLIC_SUPABASE_URL`: `https://<project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<anon-key>`
- `SUPABASE_SERVICE_ROLE_KEY`: `<service-role-key>` (Secret)
- `UPSTASH_REDIS_REST_URL`: Optional (for distributed rate limiting)
- `UPSTASH_REDIS_REST_TOKEN`: Optional

### 3. Vercel Preview Deployments
- Every push to any branch (e.g. `build-complete`) or pull request automatically generates a dedicated **Vercel Preview Deployment** with an immutable URL.
- Test preview URLs to verify on-demand ISR and admin login before merging to `main`.

---

## 🧪 Testing & Verification Commands

### 1. Run Unit Tests (URL allowlists, Magic bytes, Zod schemas, 4MB upload limits)
```bash
npm run test:unit
```

### 2. Run Playwright End-to-End Tests
```bash
npm run test:e2e
```

### 3. Run Production Build, Linter, and Typecheck
```bash
npm run lint
npx tsc --noEmit
npm run build
```

### 4. Run 200 Concurrent User Load Benchmark
```bash
npx next start -p 3000 -H 127.0.0.1 &
TARGET_URL=http://127.0.0.1:3000 npm run benchmark
```

---

## 🔄 Rollback Procedures

### Code Rollback
If you need to roll back application code to a prior commit:
```bash
git checkout main
# Or revert a specific commit:
git revert <commit-hash>
git push origin <branch>
```

### Database Rollback
To completely undo database schema, storage buckets, and policies created by `schema.sql`:
1. Open Supabase Dashboard -> **SQL Editor**.
2. Run the script in `supabase/rollback.sql`.

---

## 🌐 Cutover & Deprecation of Old GitHub Pages Site

1. **Disable GitHub Pages Deployment:**
   - In GitHub repository -> **Settings -> Pages**.
   - Under **Build and deployment -> Source**, select **None** (or uncheck GitHub Pages deployment).
   - This ensures the old client-side bundle containing the burned legacy passkey (`ugg2026`) is permanently taken offline.
2. **Configure Domain / DNS on Vercel:**
   - In Vercel Project Settings -> **Domains**.
   - Add your custom domain (e.g. `ugg.uem.edu.in`).
   - Configure DNS CNAME / ALIAS records pointing to `cname.vercel-dns.com`.
