import type { CollectionConfig } from 'payload'
import { RichTextBlock } from '../blocks/RichTextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { revalidateAstro, revalidateAstroOnDelete } from '../hooks/revalidateAstro'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'date', 'location'],
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
      name: 'name',
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
            if (data?.name) return generateSlug(String(data.name))
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
      name: 'location',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ticketUrl',
      type: 'text',
      admin: { description: 'Full URL to ticket purchase page' },
    },
    {
      name: 'details',
      type: 'blocks',
      label: 'Extended Details',
      blocks: [RichTextBlock, ImageBlock],
    },
  ],
}
