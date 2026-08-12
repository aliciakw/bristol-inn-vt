import {defineArrayMember, defineField, defineType} from 'sanity'

type AlternatingContentBlockPreviewSelection = {
  body?: Array<{
    _type?: string
    children?: Array<{text?: string}>
  }>
  media?: any
}

const getBodyPreview = (body?: AlternatingContentBlockPreviewSelection['body']) =>
  body
    ?.filter((block) => block._type === 'block')
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text?.trim())
    .filter((text): text is string => Boolean(text))
    .join(' ')
    .trim()

export const alternatingContentBlockType = defineType({
  name: 'alternatingContentBlock',
  title: 'Alternating Content',
  type: 'object',
  fields: [
    defineField({
      name: 'imagePosition',
      title: 'Image position',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'figure',
      title: 'Figure',
      type: 'figure',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Supports paragraphs, line breaks, bold, italic, underline, and links.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Heading 3', value: 'h3'},
            {title: 'Heading 4', value: 'h4'},
            {title: 'Normal', value: 'normal'},
          ],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Underline', value: 'underline'},
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'url',
                    title: 'URL',
                    type: 'string',
                    description: 'Relative path (/about) or absolute URL (https://...).',
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'ctas',
      title: 'CTAs',
      type: 'array',
      of: [defineArrayMember({type: 'buttonLink'})],
    }),
  ],
  preview: {
    select: {
      body: 'body',
      media: 'figure.image',
    },
    prepare({body, media}: AlternatingContentBlockPreviewSelection) {
      return {
        title: 'Alternating Content',
        subtitle: getBodyPreview(body) || 'Alternating Content',
        media,
      }
    },
  },
})
