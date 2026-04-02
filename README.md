# OBRA — Website

Website for the OBRA electronic music collective. Built with Astro 4, Vue 3, and Payload CMS v3.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 4](https://astro.build) — static output |
| Interactive UI | [Vue 3](https://vuejs.org) |
| Styles | [Tailwind CSS 3](https://tailwindcms.com) |
| CMS | [Payload CMS v3](https://payloadcms.com) (Next.js 15, runs separately) |
| Database | PostgreSQL 16 |
| Media | Vercel Blob (production) / local filesystem (dev) |
| Deploy | [Vercel](https://vercel.com) — two separate projects |

---

## Local Development

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### 1. Start the database

```bash
docker compose up -d
```

### 2. Start Payload CMS

```bash
cd cms
cp .env.example .env   # first time only — fill in values
npm install            # first time only
npm run migrate        # first time only
npm run dev            # runs on http://localhost:3001
```

On first run, open **http://localhost:3001/admin/create-first-user** to create your admin account.

### 3. Seed content (first time only)

```bash
cd cms
PAYLOAD_EMAIL=you@example.com PAYLOAD_PASSWORD=yourpassword npm run seed
```

### 4. Start Astro

```bash
# from repo root
npm install            # first time only
npm run dev            # runs on http://localhost:4321
```

### Environment variables

**`cms/.env`**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/obra_dev
PAYLOAD_SECRET=any-random-string-min-32-chars
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
ASTRO_URL=http://localhost:4321
BLOB_READ_WRITE_TOKEN=        # leave empty in dev
ASTRO_DEPLOY_WEBHOOK=         # leave empty in dev
```

**`.env` (Astro root)**
```
PAYLOAD_URL=http://localhost:3001
```

---

## Architecture

Two independent services communicate via REST:

```
┌──────────────────────────┐     REST API      ┌──────────────────────────┐
│   Astro (port 4321)      │ ◄──────────────── │  Payload CMS (port 3001) │
│   Static site            │                   │  Next.js 15 + PostgreSQL │
│   localhost:4321         │                   │  localhost:3001/admin    │
└──────────────────────────┘                   └──────────────────────────┘
```

- **Astro** fetches content from Payload at build time via `src/lib/payload.ts` and renders static HTML.
- **Payload** provides the admin UI (`/admin`), REST API, and stores content in PostgreSQL.
- In production, a deploy webhook triggers an Astro rebuild whenever content is published.

---

## Content Collections

| Collection | Fields |
|-----------|--------|
| Posts | title, slug, date, category, tags, cover, description, layout (blocks) |
| Events | name, slug, date, location, ticketUrl, image, description, details (blocks) |
| Podcasts | title, slug, date, embedUrl, duration, tags, description, notes (blocks) |
| Media | file uploads with thumbnail / card / hero sizes |
| Users | email/password auth with admin / editor roles |

## Content Blocks

| Block | Purpose |
|-------|---------|
| RichText | Headings, paragraphs, lists, links, inline code |
| Image | Full-width image with optional caption |
| Callout | Tip / warning / quote aside |
| Embed | Audio/video embed (SoundCloud, YouTube, etc.) |
