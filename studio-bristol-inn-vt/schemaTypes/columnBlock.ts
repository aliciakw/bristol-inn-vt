import {defineArrayMember, defineField, defineType} from 'sanity'
import {colorFields} from './colorFields'

type PortableTextSpan = {
  text?: string
}

type PortableTextBlock = {
  _type?: string
  children?: PortableTextSpan[]
}

type ColumnItem = {
  body?: PortableTextBlock[]
  image?: {
    alt?: string
    caption?: string
    layout?: string
  }
}

type ColumnBlockPreviewSelection = {
  column1?: ColumnItem
  column2?: ColumnItem
  column3?: ColumnItem
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

const getImagePreviewText = ({
  imageTitle,
  imageFilename,
  imageAlt,
}: {
  imageTitle?: string
  imageFilename?: string
  imageAlt?: string
}) => {
  return imageTitle?.trim() ?? imageFilename?.trim() ?? imageAlt?.trim()
}

const truncatePreviewText = (text: string) => {
  if (text.length <= 80) {
    return text
  }

  return `${text.slice(0, 77).trim()}...`
}

const prepareColumnBlockPreview = (
  blockTitle: string,
  {column1, column2, column3, media}: ColumnBlockPreviewSelection,
) => {
  const columnsArray = [column1, column2, column3].filter((column): column is ColumnItem =>
    Boolean(column),
  )
  const text = columnsArray.map((column) => getPortableTextPreview(column.body)).find(Boolean)
  const columnImageAlt = columnsArray.map((column) => column.image?.alt?.trim()).find(Boolean)
  const imageText = getImagePreviewText({
    imageAlt: columnImageAlt,
  })
  const title = text ?? imageText ?? blockTitle

  return {
    title: truncatePreviewText(title),
    subtitle: blockTitle,
    media,
  }
}

const columnItemFields = [
  defineField({
    name: 'body',
    title: 'Body',
    type: 'array',
    of: [defineArrayMember({type: 'block'})],
  }),
  defineField({
    name: 'image',
    title: 'Image',
    type: 'figure',
  }),
  defineField({name: 'cta', title: 'CTA', type: 'link'}),
]

const createColumnField = (columnNumber: number) =>
  defineField({
    name: `column${columnNumber}`,
    title: `Column ${columnNumber}`,
    type: 'object',
    fields: columnItemFields,
  })

const createColumnBlockType = ({
  name,
  title,
  maxColumns,
}: {
  name: string
  title: string
  maxColumns: number
}) =>
  defineType({
    type: 'object',
    name,
    title,
    fields: [
      ...Array.from({length: maxColumns}, (_, index) => createColumnField(index + 1)),
      ...colorFields,
    ],
    preview: {
      select: {
        column1: 'column1',
        column2: 'column2',
        column3: 'column3',
        media: 'column1.image.image',
      },
      prepare(selection: ColumnBlockPreviewSelection) {
        return prepareColumnBlockPreview(title, selection)
      },
    },
  })

export const singleColumnBlockType = createColumnBlockType({
  name: 'singleColumnBlock',
  title: 'Single Column',
  maxColumns: 1,
})

export const twoColumnBlockType = createColumnBlockType({
  name: 'twoColumnBlock',
  title: 'Two Columns',
  maxColumns: 2,
})

export const threeColumnBlockType = createColumnBlockType({
  name: 'threeColumnBlock',
  title: 'Three Columns',
  maxColumns: 3,
})
