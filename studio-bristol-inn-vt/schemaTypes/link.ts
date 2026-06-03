import { defineType, defineField } from 'sanity'

export const linkType = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          { title: 'URL (relative or absolute)', value: 'url' },
          { title: 'Internal page', value: 'internal' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'url',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'string',
      description: 'Relative path (/about) or absolute URL (https://...)',
      hidden: ({ parent }) => parent?.linkType !== 'url',
    }),
    defineField({
      name: 'internalLink',
      title: 'Page',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      url: 'url',
      page: 'internalLink.title',
    },
    prepare({ title, url, page }) {
      return {
        title: title ?? '(no label)',
        subtitle: page ? `→ ${page}` : url ?? '',
      }
    },
  },
})
