import { defineType, defineField, defineArrayMember } from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    // ── OG / SEO ─────────────────────────────────────────────────────────────
    defineField({
      name: 'meta',
      title: 'Page Meta',
      type: 'meta',
      description: 'For SEO and social media.',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({ name: 'title', type: 'string', title: 'Title' }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'title', maxLength: 96 },
    }),
    
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'object',
          name: 'imageBlock',
          title: 'Image Block',
          fields: [
            defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Full Width', value: 'full' }, { title: 'Contained', value: 'contained' }] },
            }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
          ],
        }),
      ],
    }),
  ],
})
