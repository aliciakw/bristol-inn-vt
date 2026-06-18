import { defineType, defineField, defineArrayMember } from 'sanity'

const reservedPageSlugs = ['faq'];

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
      validation: (Rule) => Rule.custom((value, context) => {
        if (reservedPageSlugs.includes(value?.current ?? '')) {
          return 'This slug is reserved for a special page.';
        }
        return true;
      }),
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero Image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
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
