/**
 * Seed script: reads existing markdown files from src/content/ and
 * imports them into a running Payload CMS instance via REST API.
 *
 * Usage:
 *   1. Start Payload locally: npm run dev (in cms/)
 *   2. Set env vars (PAYLOAD_URL, PAYLOAD_EMAIL, PAYLOAD_PASSWORD)
 *   3. npm run seed
 *
 * Env vars:
 *   PAYLOAD_URL      — defaults to http://localhost:3001
 *   PAYLOAD_EMAIL    — admin user email
 *   PAYLOAD_PASSWORD — admin user password
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.resolve(__dirname, '../../../src/content')
const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:3001'

// ── Frontmatter parser (copied from src/lib/github.ts) ──────────────────────

function parseFrontmatter(content: string): { data: Record<string, unknown>; body: string } {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
  const match = content.match(fmRegex)
  if (!match) return { data: {}, body: content }
  const rawYaml = match[1]
  const body = content.slice(match[0].length)
  return { data: parseSimpleYaml(rawYaml), body }
}

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = yaml.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    const kv = line.match(/^([^:]+):\s*(.*)$/)
    if (!kv) { i++; continue }
    const key = kv[1].trim()
    const rest = kv[2].trim()
    if (rest === '') {
      const items: string[] = []
      i++
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        const m = lines[i].match(/^\s+-\s+(.*)/)
        if (m) items.push(parseScalar(m[1].trim()) as string)
        i++
      }
      result[key] = items
    } else {
      result[key] = parseScalar(rest)
      i++
    }
  }
  return result
}

function parseScalar(value: string): unknown {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null' || value === '~') return null
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return value
}

// ── Markdown → Lexical JSON ─────────────────────────────────────────────────

function makeTextNode(text: string, format = 0) {
  return { detail: 0, format, mode: 'normal', style: '', text, type: 'text', version: 1 }
}

function makeParagraph(text: string) {
  return {
    children: [makeTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  }
}

function makeHeading(text: string, tag: 'h2' | 'h3' | 'h4') {
  return {
    children: [makeTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  }
}

function markdownToLexical(markdown: string) {
  const lines = markdown.split(/\r?\n/)
  const nodes: unknown[] = []
  let buffer = ''

  const flushBuffer = () => {
    const trimmed = buffer.trim()
    if (trimmed) nodes.push(makeParagraph(trimmed))
    buffer = ''
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushBuffer()
      nodes.push(makeHeading(line.slice(3).trim(), 'h2'))
    } else if (line.startsWith('### ')) {
      flushBuffer()
      nodes.push(makeHeading(line.slice(4).trim(), 'h3'))
    } else if (line.startsWith('#### ')) {
      flushBuffer()
      nodes.push(makeHeading(line.slice(5).trim(), 'h4'))
    } else if (line.trim() === '') {
      flushBuffer()
    } else {
      buffer += (buffer ? ' ' : '') + line.trim()
    }
  }
  flushBuffer()

  return {
    root: {
      children: nodes.length ? nodes : [makeParagraph('')],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const { token } = await res.json() as { token: string }
  return token
}

// ── REST helpers ─────────────────────────────────────────────────────────────

async function upsert(collection: string, slug: string, data: unknown, token: string) {
  // Check if slug already exists
  const checkRes = await fetch(
    `${PAYLOAD_URL}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  const { docs } = await checkRes.json() as { docs: Array<{ id: string }> }

  if (docs.length > 0) {
    // Update existing
    const id = docs[0].id
    const res = await fetch(`${PAYLOAD_URL}/api/${collection}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`PATCH /${collection}/${id} failed: ${res.status} ${await res.text()}`)
    console.log(`  ↻ updated  ${collection}/${slug}`)
  } else {
    // Create new
    const res = await fetch(`${PAYLOAD_URL}/api/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`POST /${collection} failed: ${res.status} ${await res.text()}`)
    console.log(`  ✓ created  ${collection}/${slug}`)
  }
}

// ── Readers ──────────────────────────────────────────────────────────────────

function readDir(subdir: string) {
  const dir = path.join(CONTENT_DIR, subdir)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
}

// ── Seed logic ───────────────────────────────────────────────────────────────

async function seedPosts(token: string) {
  console.log('\nSeeding posts...')
  for (const file of readDir('blog')) {
    const slug = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(CONTENT_DIR, 'blog', file), 'utf-8')
    const { data, body } = parseFrontmatter(raw)

    const lexical = markdownToLexical(body.trim())

    await upsert('posts', slug, {
      slug,
      title: data.title,
      description: data.description ?? null,
      date: data.date ? new Date(data.date as string).toISOString() : new Date().toISOString(),
      category: data.category ?? 'evento-interno',
      tags: Array.isArray(data.tags) ? (data.tags as string[]).map((tag) => ({ tag })) : [],
      status: data.draft ? 'draft' : 'published',
      layout: [{ blockType: 'richText', content: lexical }],
    }, token)
  }
}

async function seedEvents(token: string) {
  console.log('\nSeeding events...')
  for (const file of readDir('events')) {
    const slug = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(CONTENT_DIR, 'events', file), 'utf-8')
    const { data, body } = parseFrontmatter(raw)

    const details: unknown[] = []
    const trimmedBody = body.trim()
    if (trimmedBody) {
      details.push({ blockType: 'richText', content: markdownToLexical(trimmedBody) })
    }

    const payload: Record<string, unknown> = {
      slug,
      name: data.name,
      description: data.description ?? null,
      date: data.date ? new Date(data.date as string).toISOString() : new Date().toISOString(),
      location: data.location ?? null,
      ticketUrl: data.ticketUrl ?? null,
      status: data.draft ? 'draft' : 'published',
      details,
    }

    await upsert('events', slug, payload, token)
  }
}

async function seedPodcasts(token: string) {
  console.log('\nSeeding podcasts...')
  for (const file of readDir('podcasts')) {
    const slug = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(CONTENT_DIR, 'podcasts', file), 'utf-8')
    const { data, body } = parseFrontmatter(raw)

    const notes: unknown[] = []
    const trimmedBody = body.trim()
    if (trimmedBody) {
      notes.push({ blockType: 'richText', content: markdownToLexical(trimmedBody) })
    }

    await upsert('podcasts', slug, {
      slug,
      title: data.title,
      description: data.description ?? null,
      date: data.date ? new Date(data.date as string).toISOString() : new Date().toISOString(),
      embedUrl: data.embedUrl,
      duration: data.duration ?? null,
      tags: Array.isArray(data.tags) ? (data.tags as string[]).map((tag) => ({ tag })) : [],
      status: data.draft ? 'draft' : 'published',
      notes,
    }, token)
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const email = process.env.PAYLOAD_EMAIL
  const password = process.env.PAYLOAD_PASSWORD

  if (!email || !password) {
    console.error('Set PAYLOAD_EMAIL and PAYLOAD_PASSWORD env vars')
    process.exit(1)
  }

  console.log(`Connecting to Payload at ${PAYLOAD_URL}...`)
  const token = await login(email, password)
  console.log('Authenticated.')

  await seedPosts(token)
  await seedEvents(token)
  await seedPodcasts(token)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
