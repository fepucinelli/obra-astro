import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Posts } from './src/collections/Posts'
import { Events } from './src/collections/Events'
import { Podcasts } from './src/collections/Podcasts'
import { Media } from './src/collections/Media'
import { Users } from './src/collections/Users'

const astroUrl = process.env.ASTRO_URL ?? 'http://localhost:4321'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
  }),

  editor: lexicalEditor(),

  collections: [Posts, Events, Podcasts, Media, Users],

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Obra CMS',
    },
  },

  cors: [astroUrl],
  csrf: [astroUrl],

  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],

  typescript: {
    outputFile: './payload-types.ts',
  },
})
