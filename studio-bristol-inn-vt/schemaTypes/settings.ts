import { defineType, defineField, defineArrayMember } from 'sanity'
import {colorFields} from './colorFields'

const announcementRichTextOf = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'Small', value: 'small'},
    ],
    lists: [],
    marks: {
      decorators: [
        {title: 'Bold', value: 'strong'},
        {title: 'Italic', value: 'em'},
      ],
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
    { name: 'announcement', title: 'Announcement Bar' },
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

    // ── Announcement ────────────────────────────────────────────────────────
    defineField({
      name: 'announcementBar',
      title: 'Announcement Bar',
      type: 'object',
      description: 'Optional message displayed above the navigation on every page.',
      group: 'announcement',
      fields: [
        defineField({
          name: 'announcementBarIsEnabled',
          title: 'Enable announcement bar',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'isDismissable',
          title: 'Allow visitors to dismiss',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'cacheKey',
          title: 'Cache Key',
          type: 'slug',
          description: 'Change this value whenever dismissed visitors should see the announcement again.',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as {announcementBarIsEnabled?: boolean}
              return !parent?.announcementBarIsEnabled || value?.current
                ? true
                : 'Cache Key is required when the announcement bar is enabled.'
            }),
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'array',
          of: announcementRichTextOf,
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as {announcementBarIsEnabled?: boolean}
              if (!parent?.announcementBarIsEnabled) return true;
              return value?.length ? true : 'Body is required when the announcement bar is enabled.'
            }),
        }),
        ...colorFields,
      ],
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
    defineField({
      name: 'hideNewsletterSubscriptionForm',
      title: 'Hide newsletter subscription form',
      description: 'Turn this on to remove the newsletter subscription form from the footer.',
      type: 'boolean',
      initialValue: false,
      group: 'footer',
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
