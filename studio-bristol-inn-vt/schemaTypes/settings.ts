import { defineType, defineField, defineArrayMember } from 'sanity'

const footerRichTextOf = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Paragraph', value: 'normal' },
      { title: 'Heading', value: 'h4' },
      { title: "Small", value: 'small' },
    ],
    lists: [],
    marks: {
      decorators: [{ title: 'Italic', value: 'em' }],
      annotations: [
        defineArrayMember({
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              description: 'Relative path or absolute URL',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'openInNewTab',
              title: 'Open in new tab',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        }),
      ],
    },
  }),
]

export const settingsType = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  description: 'Site-wide settings.',
  preview: {
    select: { title: 'meta.ogTitle' },
    prepare({ title }) {
      return { title: title ?? 'Settings' }
    },
  },
  groups: [
    { name: 'navigation', title: 'Navigation' },
    { name: 'contact', title: 'Contact' },
    { name: 'footer', title: 'Footer' },
    { name: 'seo', title: 'SEO / OG' },
  ],
  fields: [
    // ── OG / SEO ─────────────────────────────────────────────────────────────
    defineField({
      name: 'meta',
      title: 'Default Page Meta',
      type: 'meta',
      description: 'Site-wide fallback used when no page-level meta is set.',
      group: 'seo',
    }),
    // ── Navigation ──────────────────────────────────────────────────────────
    defineField({
      name: 'nameplateLogo',
      title: 'Nameplate Logo',
      type: 'image',
      options: { hotspot: true },
      description: 'Horizontal, text-based logo displayed in the top nav bar on every page',
      group: 'navigation',
    }),
    defineField({
      name: 'leftCta',
      title: 'Left CTA',
      description: 'CTA button shown in the left column of the top nav bar on every page. Desktop only & optional.',
      type: 'buttonLink',
      group: 'navigation',
    }),
    defineField({
      name: 'rightCta',
      title: 'Right CTA',
      description: 'CTA button shown in the right column of the top nav bar on every page. Desktop only & optional.',
      type: 'buttonLink',
      group: 'navigation',
    }),
    defineField({
      name: 'sidebarLinks',
      title: 'Sidebar Links',
      description: 'Links shown in the nav drawer / sidebar.',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({ type: 'link' })],
    }),

    // ── Contact ──────────────────────────────────────────────────────────────
    defineField({
      name: 'contactHeading',
      title: 'Contact Heading',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactAddress',
      title: 'Address',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'contactPhone',
      title: 'Phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email',
      type: 'email',
      group: 'contact',
    }),
    defineField({
      name: 'googleMapEmbedUrl',
      title: 'Google Map Embed URL',
      description: 'Use the src URL from a Google Maps embed iframe.',
      type: 'url',
      group: 'contact',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),

    // ── Footer ───────────────────────────────────────────────────────────────
    defineField({
      name: 'footerSections',
      title: 'Footer Sections',
      description: 'Each section renders as a column of content in the footer.',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerSection',
          title: 'Footer Section',
          fields: [
            defineField({
              name: 'title',
              title: 'Section title',
              type: 'string',
              description: 'For internal use only. Will not be displayed in the footer.',
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: footerRichTextOf,
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title ?? '(untitled section)' }
            },
          },
        }),
      ],
    }),

    // ── Awards ───────────────────────────────────────────────────────────────
    defineField({
      name: 'awardImages',
      title: 'Award Images',
      description: 'Badges and award logos displayed in the footer.',
      group: 'footer',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'Link URL', type: 'string', description: 'Optional — wraps the badge in a link.' }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'directionsLink',
      title: 'Directions Link',
      description: 'The "find directions" link shown in the footer Location column.',
      type: 'link',
      group: 'footer',
    }),
  ],
})
