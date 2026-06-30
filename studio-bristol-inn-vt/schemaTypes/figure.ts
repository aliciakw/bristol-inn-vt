import {defineField, defineType} from 'sanity'

type FigurePreviewSelection = {
  media?: any
  imageTitle?: string
  imageFilename?: string
  alt?: string
  caption?: string
  layout?: string
}

const getFigurePreviewTitle = ({
  caption,
  imageTitle,
  imageFilename,
  alt,
}: FigurePreviewSelection) => {
  return caption?.trim() ?? imageTitle?.trim() ?? imageFilename?.trim() ?? alt?.trim() ?? 'Image'
}

export const figureType = defineType({
  name: 'figure',
  title: 'Figure',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {image?: unknown} | undefined

          if (parent?.image && !value?.trim()) {
            return 'Alt text is required when an image is selected.'
          }

          return true
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'rounded',
      title: 'Rounded corners',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'layout',
      title: 'Layout variant',
      type: 'string',
      initialValue: 'default',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Square', value: 'square'},
          {title: 'Full Bleed', value: 'fullbleed'},
          {title: 'Narrow', value: 'narrow'}
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      media: 'image',
      imageTitle: 'image.asset.title',
      imageFilename: 'image.asset.originalFilename',
      alt: 'alt',
      caption: 'caption',
      layout: 'layout',
    },
    prepare(selection: FigurePreviewSelection) {
      return {
        title: getFigurePreviewTitle(selection),
        subtitle: selection.layout ?? 'default',
        media: selection.media,
      }
    },
  },
})
