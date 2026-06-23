import {defineType, defineField, defineArrayMember} from 'sanity'
import {colorFields} from './colorFields'

const reservedPageSlugs = ['faq']

type PortableTextSpan = {
  text?: string
}

type PortableTextBlock = {
  _type?: string
  children?: PortableTextSpan[]
}

type ImagePreviewFields = {
  imageTitle?: string
  imageFilename?: string
  imageAlt?: string
}

type ImageBlockPreviewSelection = ImagePreviewFields & {
  media?: any
  caption?: string
  layout?: string
}

type CtaBlockPreviewSelection = {
  label?: string
  page?: string
  url?: string
}

type PageHeaderBlockPreviewSelection = ImagePreviewFields & {
  title?: string
  introduction?: PortableTextBlock[]
  media?: any
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

const getImagePreviewText = ({imageTitle, imageFilename, imageAlt}: ImagePreviewFields) => {
  return imageTitle?.trim() ?? imageFilename?.trim() ?? imageAlt?.trim()
}

const truncatePreviewText = (text: string) => {
  if (text.length <= 80) {
    return text
  }

  return `${text.slice(0, 77).trim()}...`
}

const prepareImageBlockPreview = ({
  media,
  caption,
  layout,
  imageTitle,
  imageFilename,
  imageAlt,
}: ImageBlockPreviewSelection) => {
  const title =
    caption?.trim() ?? getImagePreviewText({imageTitle, imageFilename, imageAlt}) ?? 'Image'

  return {
    title: truncatePreviewText(title),
    subtitle: layout ?? 'default',
    media,
  }
}

const prepareCtaBlockPreview = ({label, page, url}: CtaBlockPreviewSelection) => {
  const title = label?.trim() ?? page?.trim() ?? url?.trim() ?? 'CTA Button'

  return {
    title: truncatePreviewText(title),
    subtitle: 'CTA Block',
  }
}

const preparePageHeaderBlockPreview = ({
  title,
  introduction,
  media,
  imageTitle,
  imageFilename,
  imageAlt,
}: PageHeaderBlockPreviewSelection) => {
  const previewTitle =
    title?.trim() ??
    getPortableTextPreview(introduction) ??
    getImagePreviewText({imageTitle, imageFilename, imageAlt}) ??
    'Page Header'

  return {
    title: truncatePreviewText(previewTitle),
    subtitle: 'Page Header',
    media,
  }
}

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    {name: 'config', title: 'Configuration'},
    {name: 'editorial', title: 'Editorial'},
  ],
  fields: [
    // ── OG / SEO ─────────────────────────────────────────────────────────────
    defineField({
      name: 'meta',
      title: 'Page Meta',
      type: 'meta',
      description: 'For SEO and social media.',
      group: 'config',
      options: {collapsible: true, collapsed: true},
    }),
    defineField({name: 'title', type: 'string', title: 'Title'}),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      group: 'config',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (reservedPageSlugs.includes(value?.current ?? '')) {
            return 'This slug is reserved for a special page.'
          }
          return true
        }),
    }),
    defineField({
      name: 'pageHeader',
      title: 'Page Header',
      type: 'object',
      options: {collapsible: true},
      group: 'editorial',
      fields: [
        defineField({
          name: 'introduction',
          title: 'Introduction',
          type: 'array',
          of: [defineArrayMember({type: 'block'})],
        }),
        defineField({
          name: 'heroImage',
          type: 'image',
          title: 'Hero Image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
        }),
        ...colorFields,
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'singleImageBlock',
          title: 'Image',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: {hotspot: true},
              fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
            }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              initialValue: 'default',
              options: {
                list: [
                  {title: 'Default', value: 'default'},
                  {title: 'Full Bleed', value: 'fullbleed'},
                ],
                layout: 'radio',
              },
            }),
            defineField({name: 'caption', type: 'string', title: 'Caption'}),
            ...colorFields,
          ],
          preview: {
            select: {
              media: 'image',
              caption: 'caption',
              layout: 'layout',
              imageTitle: 'image.asset.title',
              imageFilename: 'image.asset.originalFilename',
              imageAlt: 'image.alt',
            },
            prepare(selection: ImageBlockPreviewSelection) {
              return prepareImageBlockPreview(selection)
            },
          },
        }),
        // ── CTA ───────────────────────────────────────────────────────────────
        defineArrayMember({
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA Button',
          fields: [defineField({name: 'cta', type: 'link', title: 'Button'}), ...colorFields],
          preview: {
            select: {
              label: 'cta.label',
              page: 'cta.internalLink.title',
              url: 'cta.url',
            },
            prepare(selection: CtaBlockPreviewSelection) {
              return prepareCtaBlockPreview(selection)
            },
          },
        }),
        // ── Page header ───────────────────────────────────────────────────────
        defineArrayMember({
          type: 'object',
          name: 'pageHeaderBlock',
          title: 'Page Header',
          fields: [
            defineField({name: 'title', type: 'string', title: 'Title'}),
            defineField({
              name: 'introduction',
              title: 'Introduction',
              type: 'array',
              of: [defineArrayMember({type: 'block'})],
            }),
            defineField({
              name: 'heroImage',
              type: 'image',
              title: 'Hero Image',
              options: {hotspot: true},
              fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
            }),
            ...colorFields,
          ],
          preview: {
            select: {
              title: 'title',
              introduction: 'introduction',
              media: 'heroImage',
              imageTitle: 'heroImage.asset.title',
              imageFilename: 'heroImage.asset.originalFilename',
              imageAlt: 'heroImage.alt',
            },
            prepare(selection: PageHeaderBlockPreviewSelection) {
              return preparePageHeaderBlockPreview(selection)
            },
          },
        }),
        // ── Column layouts ────────────────────────────────────────────────────
        defineArrayMember({type: 'singleColumnBlock'}),
        defineArrayMember({type: 'twoColumnBlock'}),
        defineArrayMember({type: 'threeColumnBlock'}),
      ],
    }),
  ],
})
