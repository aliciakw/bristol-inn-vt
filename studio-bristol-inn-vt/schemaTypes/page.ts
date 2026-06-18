  import { defineType, defineField, defineArrayMember } from 'sanity'
  import { colorFields } from './colorFields'

const reservedPageSlugs = ['faq'];

const columnItemFields = [
  defineField({
    name: 'body',
    title: 'Body',
    type: 'array',
    of: [defineArrayMember({ type: 'block' })],
  }),
  defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    options: { hotspot: true },
    fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
  }),
  defineField({ name: 'cta', title: 'CTA', type: 'link' }),
];

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    { name: 'config', title: 'Configuration' },
    { name: 'editorial', title: 'Editorial' },
  ],
  fields: [
    // ── OG / SEO ─────────────────────────────────────────────────────────────
    defineField({
      name: 'meta',
      title: 'Page Meta',
      type: 'meta',
      description: 'For SEO and social media.',
      group: 'config',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({ name: 'title', type: 'string', title: 'Title' }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      group: 'config',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.custom((value, context) => {
        if (reservedPageSlugs.includes(value?.current ?? '')) {
          return 'This slug is reserved for a special page.';
        }
        return true;
      }),
    }),
    defineField({
      name: 'pageHeader',
      title: 'Page Header',
      type: 'object',
      options: { collapsible: true },
      group: 'editorial',
      fields: [
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
        ...colorFields,
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        // ── Image blocks ──────────────────────────────────────────────────────
        defineArrayMember({
          type: 'object',
          name: 'imageBlock',
          title: 'Image Block (legacy)',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
            }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Full Width', value: 'full' }, { title: 'Contained', value: 'contained' }] },
            }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            ...colorFields,
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'singleImageBlock',
          title: 'Image',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
            }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              initialValue: 'default',
              options: { list: [{ title: 'Default', value: 'default' }, { title: 'Full Bleed', value: 'fullbleed' }], layout: 'radio' },
            }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            ...colorFields,
          ],
          preview: {
            select: { media: 'image', caption: 'caption', layout: 'layout' },
            prepare({ media, caption, layout }: { media?: any; caption?: string; layout?: string }) {
              return { title: caption ?? '(no caption)', subtitle: layout ?? 'default', media };
            },
          },
        }),
        // ── CTA ───────────────────────────────────────────────────────────────
        defineArrayMember({
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA Button',
          fields: [
            defineField({ name: 'cta', type: 'link', title: 'Button' }),
            ...colorFields,
          ],
          preview: {
            select: { label: 'cta.label' },
            prepare({ label }: { label?: string }) {
              return { title: label ?? '(no label)', subtitle: 'CTA Block' }
            },
          },
        }),
        // ── Page header ───────────────────────────────────────────────────────
        defineArrayMember({
          type: 'object',
          name: 'pageHeaderBlock',
          title: 'Page Header',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Title' }),
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
            ...colorFields,
          ],
          preview: {
            select: { title: 'title', media: 'heroImage' },
            prepare({ title, media }: { title?: string; media?: any }) {
              return { title: title ?? '(no title)', subtitle: 'Page Header', media };
            },
          },
        }),
        // ── Column layouts ────────────────────────────────────────────────────
        defineArrayMember({
          type: 'object',
          name: 'singleColumnBlock',
          title: 'Single Column',
          fields: [
            defineField({
              name: 'columns',
              title: 'Content',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'columnItem',
                  title: 'Column',
                  fields: columnItemFields,
                }),
              ],
              validation: (Rule) => Rule.max(1),
            }),
            ...colorFields,
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'twoColumnBlock',
          title: 'Two Columns',
          fields: [
            defineField({
              name: 'columns',
              title: 'Columns',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'columnItem',
                  title: 'Column',
                  fields: columnItemFields,
                }),
              ],
              validation: (Rule) => Rule.max(2),
            }),
            ...colorFields,
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'threeColumnBlock',
          title: 'Three Columns',
          fields: [
            defineField({
              name: 'columns',
              title: 'Columns',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'columnItem',
                  title: 'Column',
                  fields: columnItemFields,
                }),
              ],
              validation: (Rule) => Rule.max(3),
            }),
            ...colorFields,
          ],
        }),
      ],
    }),
  ],
})
