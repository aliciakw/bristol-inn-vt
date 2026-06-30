import {defineArrayMember, defineField, defineType} from 'sanity'
import {colorFields} from './colorFields'

type PortableTextSpan = {
  text?: string
}

type PortableTextBlock = {
  _type?: string
  children?: PortableTextSpan[]
}

type RoomSearchFormPreviewSelection = {
  introduction?: PortableTextBlock[]
  media?: any
}

type GalleryStripPreviewSelection = {
  images?: unknown[]
}

type FigureValue = {
  image?: any
}

type TestimonialGalleryPreviewSelection = {
  heading?: string
  items?: unknown[]
}

const getPortableTextPreview = (body?: PortableTextBlock[]) => {
  return body
    ?.filter((block) => block._type === 'block')
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text?.trim())
    .filter((text): text is string => Boolean(text))
    .join(' ')
    .trim()
}

const truncatePreviewText = (text: string) => {
  if (text.length <= 80) {
    return text
  }

  return `${text.slice(0, 77).trim()}...`
}

const isFigureWithImage = (item: unknown): item is FigureValue => {
  return Boolean(
    item &&
      typeof item === 'object' &&
      'image' in item &&
      (item as FigureValue).image?.asset,
  )
}

const introductionPortableTextField = defineField({
  name: 'introduction',
  title: 'Introduction',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Heading', value: 'h2'},
        {title: 'Paragraph', value: 'normal'},
        {title: 'Caption', value: 'caption'},
      ],
      lists: [],
    }),
  ],
})

export const roomSearchFormBlockType = defineType({
  name: 'roomSearchFormBlock',
  title: 'Room Search Form',
  type: 'object',
  fields: [
    introductionPortableTextField,
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'figure',
    }),
    ...colorFields,
  ],
  preview: {
    select: {
      introduction: 'introduction',
      media: 'icon.image',
    },
    prepare({introduction, media}: RoomSearchFormPreviewSelection) {
      return {
        title: truncatePreviewText(getPortableTextPreview(introduction) ?? 'Room Search Form'),
        subtitle: 'Room Search Form',
        media,
      }
    },
  },
})

export const galleryStripBlockType = defineType({
  name: 'galleryStripBlock',
  title: 'Gallery Strip',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      description: 'A continuous strip of scrolling images.',
      type: 'array',
      of: [defineArrayMember({type: 'figure'})],
      validation: (Rule) => Rule.min(2),
    }),
    ...colorFields,
  ],
  preview: {
    select: {
      images: 'images',
    },
    prepare({images}: GalleryStripPreviewSelection) {
      const figuresWithImages = images?.filter(isFigureWithImage) ?? []
      const count = figuresWithImages.length

      return {
        title: count === 1 ? '1 image' : `${count} images`,
        subtitle: 'Gallery Strip',
        media: figuresWithImages[0]?.image,
      }
    },
  },
})

export const testimonialGalleryBlockType = defineType({
  name: 'testimonialGalleryBlock',
  title: 'Testimonial Gallery',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Testimonials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'testimonial'}],
        }),
      ],
      validation: (Rule) => Rule.max(12),
    }),
    ...colorFields,
  ],
  preview: {
    select: {
      heading: 'heading',
      items: 'items',
    },
    prepare({heading, items}: TestimonialGalleryPreviewSelection) {
      const count = items?.length ?? 0

      return {
        title: heading?.trim() || 'Testimonial Gallery',
        subtitle: count === 1 ? '1 item' : `${count} items`,
      }
    },
  },
})
