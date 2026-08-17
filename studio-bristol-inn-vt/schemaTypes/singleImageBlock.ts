import {defineField, defineType} from 'sanity'
import {layoutOptionFields, layoutOptionsFieldset} from './layoutOptions'

type SingleImageBlockPreviewSelection = {
  media?: any
  layout?: string
  imageFilename?: string
}

export const singleImageBlockType = defineType({
  name: 'singleImageBlock',
  title: 'Image',
  type: 'object',
  fieldsets: [layoutOptionsFieldset],
  fields: [
    ...layoutOptionFields,
    defineField({
      name: 'image',
      title: 'Image',
      type: 'figure',
    }),
  ],
  preview: {
    select: {
      media: 'image.image',
      layout: 'image.layout',
      imageFilename: 'image.image.asset.originalFilename',
    },
    prepare({media, layout, imageFilename}: SingleImageBlockPreviewSelection) {
      return {
        title: 'Single Image Block',
        subtitle: `${layout ?? 'default'} — ${imageFilename?.trim() ?? 'No image selected'}`,
        media,
      }
    },
  },
})
