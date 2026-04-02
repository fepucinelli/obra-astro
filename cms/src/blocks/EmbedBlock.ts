import type { Block } from 'payload'

export const EmbedBlock: Block = {
  slug: 'embed',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'YouTube, SoundCloud, or other embeddable URL',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
