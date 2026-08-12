import {defineField, defineType} from 'sanity'

export const sectionTitleBlockType = defineType({
  name: 'sectionTitleBlock',
  title: 'Section Title',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'icon',
    },
    prepare({title, media}: {title?: string; media?: any}) {
      return {
        title: 'Section Title',
        subtitle: title?.trim() || 'Section Title',
        media,
      }
    },
  },
})
