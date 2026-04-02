import type { CollectionConfig } from 'payload'
import { RichTextBlock } from '../blocks/RichTextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { revalidateAstro, revalidateAstroOnDelete } from '../hooks/revalidateAstro'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const Podcasts: CollectionConfig = {
  slug: 'podcasts',
  labels: { singular: 'Podcast', plural: 'Podcasts' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'date', 'duration'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateAstro],
    afterDelete: [revalidateAstroOnDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            if (data?.title) return generateSlug(String(data.title))
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'embedUrl',
      type: 'text',
      required: true,
      admin: { description: 'SoundCloud, YouTube, or other embeddable URL' },
    },
    {
      name: 'duration',
      type: 'text',
      admin: { description: 'e.g. 1:32:47' },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'notes',
      type: 'blocks',
      label: 'Show Notes',
      blocks: [RichTextBlock, ImageBlock],
    },
  ],
}
