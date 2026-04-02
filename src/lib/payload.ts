/**
 * Typed Payload CMS REST API client for the Astro frontend.
 * Consumed at build time (getStaticPaths) and optionally at request time (SSR).
 */

const PAYLOAD_URL = import.meta.env.PAYLOAD_URL ?? 'http://localhost:3001'

// ── Lexical block types ──────────────────────────────────────────────────────

export type LexicalContent = Record<string, unknown>

export type RichTextBlock = { blockType: 'richText'; id?: string; content: LexicalContent }
export type ImageBlock = {
  blockType: 'image'
  id?: string
  image: { url: string; alt: string; sizes?: Record<string, { url: string }> }
  caption?: string
  alt?: string
}
export type CalloutBlock = {
  blockType: 'callout'
  id?: string
  variant: 'tip' | 'warning' | 'quote'
  content: LexicalContent
}
export type EmbedBlock = { blockType: 'embed'; id?: string; url: string; caption?: string }

export type PayloadBlock = RichTextBlock | ImageBlock | CalloutBlock | EmbedBlock

// ── Domain types ─────────────────────────────────────────────────────────────

export interface PayloadPost {
  id: string
  slug: string
  title: string
  description?: string
  date: Date
  cover?: string
  category: 'evento-interno' | 'evento-rua' | 'evento-coletivo'
  tags: string[]
  status: 'draft' | 'published'
  layout: PayloadBlock[]
}

export interface PayloadEvent {
  id: string
  slug: string
  name: string
  description?: string
  date: Date
  image?: string
  location?: string
  ticketUrl?: string
  status: 'draft' | 'published'
  details: PayloadBlock[]
}

export interface PayloadPodcast {
  id: string
  slug: string
  title: string
  description?: string
  date: Date
  embedUrl: string
  duration?: string
  tags: string[]
  status: 'draft' | 'published'
  notes: PayloadBlock[]
}

// ── Raw API shapes (before transformation) ──────────────────────────────────

interface RawMedia {
  url?: string
  alt?: string
  sizes?: Record<string, { url?: string }>
}

interface RawPost {
  id: string
  slug: string
  title: string
  description?: string
  date: string
  cover?: RawMedia | null
  category: string
  tags?: Array<{ tag: string }>
  status: string
  layout?: PayloadBlock[]
}

interface RawEvent {
  id: string
  slug: string
  name: string
  description?: string
  date: string
  image?: RawMedia | null
  location?: string
  ticketUrl?: string
  status: string
  details?: PayloadBlock[]
}

interface RawPodcast {
  id: string
  slug: string
  title: string
  description?: string
  date: string
  embedUrl: string
  duration?: string
  tags?: Array<{ tag: string }>
  status: string
  notes?: PayloadBlock[]
}

// ── HTTP helper ──────────────────────────────────────────────────────────────

async function fetchPayload<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${PAYLOAD_URL}/api${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Payload API error: ${res.status} ${url}`)
  return res.json() as Promise<T>
}

// ── Transformers ─────────────────────────────────────────────────────────────

function transformPost(raw: RawPost): PayloadPost {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    date: new Date(raw.date),
    cover: raw.cover?.url ?? undefined,
    category: raw.category as PayloadPost['category'],
    tags: raw.tags?.map((t) => t.tag) ?? [],
    status: raw.status as PayloadPost['status'],
    layout: raw.layout ?? [],
  }
}

function transformEvent(raw: RawEvent): PayloadEvent {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    date: new Date(raw.date),
    image: raw.image?.url ?? undefined,
    location: raw.location,
    ticketUrl: raw.ticketUrl,
    status: raw.status as PayloadEvent['status'],
    details: raw.details ?? [],
  }
}

function transformPodcast(raw: RawPodcast): PayloadPodcast {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    date: new Date(raw.date),
    embedUrl: raw.embedUrl,
    duration: raw.duration,
    tags: raw.tags?.map((t) => t.tag) ?? [],
    status: raw.status as PayloadPodcast['status'],
    notes: raw.notes ?? [],
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<PayloadPost[]> {
  const { docs } = await fetchPayload<{ docs: RawPost[] }>('/posts', {
    'where[status][equals]': 'published',
    limit: '200',
    depth: '1',
    sort: '-date',
  })
  return docs.map(transformPost)
}

export async function getPostBySlug(slug: string): Promise<PayloadPost | null> {
  const { docs } = await fetchPayload<{ docs: RawPost[] }>('/posts', {
    'where[slug][equals]': slug,
    'where[status][equals]': 'published',
    depth: '1',
    limit: '1',
  })
  return docs[0] ? transformPost(docs[0]) : null
}

export async function getAllEvents(): Promise<PayloadEvent[]> {
  const { docs } = await fetchPayload<{ docs: RawEvent[] }>('/events', {
    'where[status][equals]': 'published',
    limit: '200',
    depth: '1',
    sort: '-date',
  })
  return docs.map(transformEvent)
}

export async function getEventBySlug(slug: string): Promise<PayloadEvent | null> {
  const { docs } = await fetchPayload<{ docs: RawEvent[] }>('/events', {
    'where[slug][equals]': slug,
    'where[status][equals]': 'published',
    depth: '1',
    limit: '1',
  })
  return docs[0] ? transformEvent(docs[0]) : null
}

export async function getAllPodcasts(): Promise<PayloadPodcast[]> {
  const { docs } = await fetchPayload<{ docs: RawPodcast[] }>('/podcasts', {
    'where[status][equals]': 'published',
    limit: '200',
    depth: '1',
    sort: '-date',
  })
  return docs.map(transformPodcast)
}

export async function getPodcastBySlug(slug: string): Promise<PayloadPodcast | null> {
  const { docs } = await fetchPayload<{ docs: RawPodcast[] }>('/podcasts', {
    'where[slug][equals]': slug,
    'where[status][equals]': 'published',
    depth: '1',
    limit: '1',
  })
  return docs[0] ? transformPodcast(docs[0]) : null
}
