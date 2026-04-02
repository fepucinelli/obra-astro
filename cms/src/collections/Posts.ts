import type { CollectionConfig } from 'payload'
import { RichTextBlock } from '../blocks/RichTextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { CalloutBlock } from '../blocks/CalloutBlock'
import { EmbedBlock } from '../blocks/EmbedBlock'
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

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'category', 'date'],
    meta: { titleSuffix: '— Blog' },
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Evento Interno', value: 'evento-interno' },
        { label: 'Evento de Rua', value: 'evento-rua' },
        { label: 'Evento Coletivo', value: 'evento-coletivo' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
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
      name: 'layout',
      type: 'blocks',
      label: 'Content',
      blocks: [RichTextBlock, ImageBlock, CalloutBlock, EmbedBlock],
    },
  ],
}
