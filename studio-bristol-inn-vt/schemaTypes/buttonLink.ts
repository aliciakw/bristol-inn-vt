import { defineType, defineField } from 'sanity'

export const buttonLinkType = defineType({
  name: 'buttonLink',
  title: 'Button Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          { title: 'Sand', value: 'sand-100' },
          { title: 'Stone', value: 'sand-200' },
          { title: 'Khaki', value: 'khaki-200' },
          { title: 'Forest', value: 'forest-400' },
          { title: 'Lilac', value: 'lilac-200' },
          { title: 'Prussian', value: 'prussian-500' },
        ],
      },
      initialValue: 'sand',
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
