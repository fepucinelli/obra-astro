# OBRA — Website

Website for the OBRA electronic music collective. Built with Astro 4, Vue 3, and a headless CMS powered by the GitHub repository itself.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 4](https://astro.build) — SSR via Vercel serverless |
| Interactive UI | [Vue 3](https://vuejs.org) — only where interactivity is needed |
| Styles | [Tailwind CSS 3](https://tailwindcss.com) + custom CSS |
| CMS | GitHub API (`.md` files in the repository) |
| Auth | GitHub OAuth 2.0 + AES-256-GCM session |
| Deploy | [Vercel](https://vercel.com) serverless |
| Sitemap | `@astrojs/sitemap` |

---

## Architecture

### Philosophy

The site follows Astro's **islands architecture**: all HTML is generated on the server (or at build time for static routes). Vue is used exclusively for components that require client-side interactivity — filters, embed player, admin form. Pages without interactivity are pure Astro, resulting in zero JavaScript shipped to the client on those routes.

### GitHub as CMS

There is no database. Content lives in `src/content/` as Markdown files with YAML frontmatter. The `/admin` panel authenticates via GitHub OAuth and writes directly to the GitHub API — every create, edit, or delete results in a commit to the repository.

This model has important implications:

- **Automatic deploys**: any commit to the repository (including those made via the admin) triggers a Vercel deploy.
- **Content history**: all content has native version history via `git log`.
- **No database server**: zero additional infrastructure.
- **Restricted admin access**: only users with access to the GitHub repository can authenticate.

### Static vs. Dynamic Routes

```
Static (prerender = true, generated at build time)
├── /
├── /about
├── /press
├── /404
├── /blog
├── /blog/[slug]      — one HTML file per post
├── /events
├── /events/[slug]
├── /podcasts
└── /podcasts/[slug]

Dynamic (SSR, serverless function on Vercel)
├── /auth/login       — redirects to GitHub OAuth
├── /auth/callback    — exchanges code for token, creates session
├── /auth/logout      — clears session cookie
├── /admin/**         — CMS panel (requires session)
└── /api/content/[type]  — REST API for the admin panel
```

### Session Security

The session is stored in an `HttpOnly; Secure; SameSite=Lax` cookie with the content encrypted using **AES-256-GCM**:

```
cookie = iv (12 bytes) + authTag (16 bytes) + ciphertext  →  hex string
```

The key is derived from `SESSION_SECRET` (64 hex chars = 32 bytes). Legacy Base64 sessions are treated as invalid and silently discarded (fallback to `{}`).

### Authentication Middleware

`src/middleware.ts` protects all `/admin` routes. It applies double `decodeURIComponent` + slash normalization as a mitigation against authentication bypasses via URL encoding (CVEs GHSA-ggxq-hp9w-j794 and GHSA-whqg-ppgf-wp8c).

### CSP and Security Headers

All headers are applied via `vercel.json` at the CDN level:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `script-src 'self'` — no `unsafe-inline` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | 2 years, includeSubDomains, preload |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | geolocation, camera, microphone, payment blocked |

Google Fonts are loaded via `<link rel="preload" as="style">` activated by an external script — keeping `script-src 'self'` without needing `unsafe-inline`.

---

## Project Structure

```
obra-astro/
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── AdminForm.vue        # CRUD form for blog/events/podcasts
│   │   ├── CategoryFilter.vue   # Blog post filter by category (Vue island)
│   │   ├── DateFilter.vue       # Event filter by year (Vue island)
│   │   └── EmbedPlayer.vue      # YouTube / SoundCloud player (Vue island)
│   ├── content/
│   │   ├── config.ts            # Zod schemas for content collections
│   │   ├── blog/                # Blog posts as .md files
│   │   ├── events/              # Events as .md files
│   │   └── podcasts/            # Podcast episodes as .md files
│   ├── layouts/
│   │   ├── BaseLayout.astro     # Main layout (nav, footer, SEO, JSON-LD)
│   │   └── AdminLayout.astro    # Admin panel layout (sidebar)
│   ├── lib/
│   │   ├── auth.ts              # GitHub OAuth + AES-256-GCM session
│   │   └── github.ts            # GitHub API client + YAML/frontmatter parser
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── press.astro
│   │   ├── 404.astro
│   │   ├── blog/
│   │   ├── events/
│   │   ├── podcasts/
│   │   ├── auth/                # login.ts · callback.ts · logout.ts
│   │   ├── api/content/[type].ts  # REST API (GET / POST / PUT / DELETE)
│   │   └── admin/               # CMS panel
│   ├── styles/
│   │   └── global.css           # Design tokens + utilities
│   └── middleware.ts            # Route protection + URL sanitization
├── astro.config.mjs
├── tailwind.config.mjs
├── vercel.json                  # Security headers
├── .env.example
└── tsconfig.json
```

---

## Content Collections

### Blog

```yaml
---
title: string           # required
description: string     # optional
date: date              # required
cover: string           # image URL (optional)
category: enum          # "evento-interno" | "evento-rua" | "evento-coletivo"
tags: string[]          # default []
draft: boolean          # default false
---
```

### Events

```yaml
---
name: string            # required
description: string     # optional
date: date              # required
image: string           # URL (optional)
location: string        # optional
ticketUrl: string       # valid URL (optional)
draft: boolean          # default false
---
```

### Podcasts

```yaml
---
title: string           # required
description: string     # optional
date: date              # required
embedUrl: string        # YouTube or SoundCloud URL (required)
duration: string        # e.g. "1h 23min" (optional)
tags: string[]          # default []
draft: boolean          # default false
---
```

Entries with `draft: true` are excluded from all public pages and the sitemap.

---

## Design System

The design uses a minimalist/brutalist visual vocabulary:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#080808` | Main background |
| `--color-text` | `#F0EDE6` | Main text |
| `--color-accent` | `#C8FF00` | Acid green — CTAs, highlights |
| `--color-card` | `#1A1A1A` | Cards and boxes |
| `--color-muted` | `#444444` | Secondary text |
| `--font-display` | Syne 800 | Headings and wordmark |
| `--font-mono` | Space Mono | Labels, badges, nav |
| `--font-body` | Barlow Condensed | Body text |

Fonts are loaded from Google Fonts with a non-blocking strategy: Syne uses `display=swap` with calibrated fallback metrics to minimize CLS; Space Mono and Barlow use `display=optional` (zero CLS, no font swap flash).

Animations respect `prefers-reduced-motion` — grain, marquee, reveal, and geometric animations are automatically disabled.

---

## Admin API

The panel uses a single API route with four HTTP verbs:

```
GET    /api/content/[type]?slug=xxx   → Fetch a single file
GET    /api/content/[type]            → List all files
POST   /api/content/[type]            → Create new (slug auto-generated from title)
PUT    /api/content/[type]            → Update existing (slug in request body)
DELETE /api/content/[type]            → Delete (slug in request body)
```

`[type]` only accepts `blog`, `events`, or `podcasts` (whitelist). Slugs are validated against `/^[a-z0-9-]{1,100}$/` to prevent path traversal. All routes require a valid session.

---

## Setup and Installation

### Prerequisites

- Node.js 18+
- A GitHub account
- A GitHub repository (this one works)
- A GitHub OAuth App

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# GitHub OAuth App (create at github.com/settings/developers)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:4321/auth/callback

# Repository where content will be saved
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=obra-astro

# GitHub token with write access to the repository (for CI / direct writes)
GITHUB_TOKEN=ghp_...

# Session key: 64 hexadecimal characters (AES-256)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=
```

### Creating a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Homepage URL**: `https://obra.xyz` (or `http://localhost:4321` for dev)
   - **Authorization callback URL**: `https://obra.xyz/auth/callback`
3. Copy the **Client ID** and generate a **Client Secret**

### Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:4321
```

### Production Build

```bash
npm run build
# Output: .vercel/output/

npm run preview
# Local preview of the production build
```

### Deploying to Vercel

The project is configured for automatic deployment on Vercel:

1. Connect the repository to Vercel
2. Set the environment variables in the Vercel dashboard
3. Any push to `main` triggers a deploy

For the production callback URL, remember to update `GITHUB_REDIRECT_URI` and the OAuth App on GitHub.

---

## Admin Panel

Navigate to `/admin` to manage content. The flow is:

1. `/admin` → redirects to `/auth/login`
2. `/auth/login` → redirects to GitHub OAuth
3. GitHub authenticates and redirects to `/auth/callback`
4. Session created → panel access granted

The panel allows creating, editing, and deleting blog posts, events, and podcasts. Each operation commits to the repository via the GitHub API, which triggers an automatic redeploy on Vercel.

---

## SEO and Structured Data

Each page type emits the appropriate JSON-LD:

- **All pages**: `Organization` schema (OBRA)
- **Blog posts**: `Article` schema with headline, description, image, datePublished
- **Events**: `Event` schema with name, startDate, location, description
- **Sitemap**: `https://obra.xyz/sitemap-index.xml` (`/admin` routes excluded)
- **Robots**: `public/robots.txt` allows all crawlers

---

## Architectural Decisions

### Why Astro instead of Next.js?

Astro was chosen for its **zero JavaScript by default** philosophy. The OBRA website is primarily static content — blog posts, events, podcasts. Next.js would ship React runtime to every page even without interactivity. Astro generates pure HTML for public pages and uses Vue only where necessary (filters, player).

### Why Vue instead of React?

Vue was chosen for its smaller runtime size and ergonomics for simple UI components. The project's interactive components (filters, player, admin form) are self-contained and would not benefit from a larger React ecosystem.

### Why GitHub as CMS instead of a headless CMS?

The OBRA team already uses GitHub for development. An external CMS would add: a third-party service account, an additional API token, an external uptime dependency, and a data model separate from the code. With GitHub as the CMS, content lives alongside the code, has native version history, and deploys happen automatically on every content change — no additional webhooks required.

The tradeoff is that the admin is more technical than a CMS like Contentful or Sanity. At the project's current scale this is acceptable.

### Why SSR (server output) instead of pure SSG?

The admin panel and auth routes (`/auth/callback`, `/auth/logout`) are inherently dynamic — they need responses based on session state. Astro allows mixing both: public routes marked with `export const prerender = true` are generated as static HTML; dynamic routes run as serverless functions.

### Why AES-256-GCM instead of a session library?

`iron-session` is listed as a dependency but is not being used. AES-256-GCM with Node.js's built-in `crypto` module was implemented directly for:

1. Zero additional runtime dependencies
2. Full control over the format (IV + auth tag + ciphertext in hex)
3. Authenticated encryption (GCM validates integrity — a tampered cookie is rejected)
