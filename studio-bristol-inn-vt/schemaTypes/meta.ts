import { defineType, defineField } from 'sanity'

export const metaType = defineType({
  name: 'meta',
  title: 'Page Meta',
  type: 'object',
  fields: [
    defineField({
      name: 'ogTitle',
      title: 'OG Title',
      type: 'string',
      description: 'Defaults to the page title if left empty.',
    }),
    defineField({
      name: 'ogDescription',
      title: 'OG Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Recommended: 1200 × 630 px.',
    }),
  ],
})
