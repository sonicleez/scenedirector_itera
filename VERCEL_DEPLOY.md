# 🚀 Vercel Deployment Guide - Scene Director

## 1. Vercel Project Setup

### Framework Preset: **Vite**
### Root Directory: `./`

---

## 2. Environment Variables (Required)

Add these in Vercel → Settings → Environment Variables:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJ...` | Supabase Anon/Public Key |

### Get from Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 3. Build & Output Settings

Vercel auto-detects Vite, but verify:

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## 4. Deploy Steps

### Option A: New Project
1. Go to https://vercel.com/new
2. Import `sonicleez/scense_director` from GitHub
3. Framework: **Vite**
4. Add Environment Variables (from step 2)
5. Click **Deploy**

### Option B: Existing Project - Redeploy
1. Go to Vercel Dashboard
2. Select project `scense-director`
3. Click **Deployments** tab
4. Click **...** on latest deployment
5. Select **Redeploy**

---

## 5. Auto-Deploy Setup

To enable auto-deploy on push:

1. Go to Vercel Project → **Settings** → **Git**
2. Ensure **Production Branch** is `main`
3. Check **Auto-Deploy** is enabled
4. Verify webhook is connected to GitHub

---

## 6. Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Supabase credentials to .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 7. Troubleshooting

### Deployment not updating?
1. Check if commit is on `main` branch
2. Force redeploy from Vercel dashboard
3. Check webhook in Settings → Git → Webhooks

### Build fails?
1. Check environment variables are set
2. Run `npm run build` locally first
3. Check Vercel logs for errors

### Blank page after deploy?
1. Verify `VITE_SUPABASE_URL` starts with `https://`
2. Check browser console for errors
3. Ensure Supabase RLS policies allow access

---

## 8. Environment Variables Template

Create `.env` file locally:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Optional - for debugging
VITE_DEBUG=false
```

---

## 9. Supabase SQL Setup (After Deploy)

Run these SQL files in order in Supabase SQL Editor:

1. `SUPABASE_SCHEMA.sql` - Core tables
2. `SUPABASE_USER_STATS_SCHEMA.sql` - Usage stats tables  
3. `SUPABASE_ADMIN_SIMPLE.sql` - Admin setup
4. `SUPABASE_FIX_API_KEYS_RLS.sql` - API keys RLS
5. `SUPABASE_FIX_GOMMO_RLS.sql` - Gommo credentials RLS

---

## 10. Vercel-Supabase Connection Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase project is active
- [ ] RLS policies configured
- [ ] `is_admin()` function created
- [ ] Admin users set (role = 'admin')
- [ ] Authentication enabled in Supabase

---

## Quick Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sonicleez/scense_director)

---

**Last Updated:** 2026-01-04
