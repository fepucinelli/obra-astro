import type { Block } from 'payload'

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'tip',
      options: [
        { label: 'Tip', value: 'tip' },
        { label: 'Warning', value: 'warning' },
        { label: 'Quote', value: 'quote' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
