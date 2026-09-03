import {defineType, defineField, defineArrayMember} from 'sanity'
import {colorFields } from './colorFields'

export const homepageType = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  preview: {
    prepare() {
      return {title: 'Homepage'}
    },
  },
  fields: [
    defineField({
      name: 'heroLeftImage',
      title: 'Hero Collage — Left Image',
      description: 'Left panel of the hero collage (e.g. nature or landscape photo).',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'heroRightImage',
      title: 'Hero Collage — Right Image',
      description: 'Right panel of the hero collage (e.g. building exterior photo).',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),

    // Flexible body (SliceZone)
    defineField({
      name: 'body',
      title: 'Body',
      description: 'Renders below everything else on the homepage.',
      type: 'array',
      of: [
        defineArrayMember({type: 'singleImageBlock'}),
        defineArrayMember({
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA Button',
          fields: [
            defineField({name: 'image', type: 'figure', title: 'Image'}),
            defineField({name: 'cta', type: 'link', title: 'Button'}),
            ...colorFields,
          ],
          preview: {
            select: {label: 'cta.label', media: 'image.image'},
            prepare({label, media}: {label?: string; media?: any}) {
              return {title: label ?? '(no label)', subtitle: 'CTA Block', media}
            },
          },
        }),
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
            select: {title: 'title', media: 'heroImage'},
            prepare({title, media}: {title?: string; media?: any}) {
              return {title: title ?? '(no title)', subtitle: 'Page Header', media}
            },
          },
        }),
        defineArrayMember({type: 'singleColumnBlock'}),
        defineArrayMember({type: 'twoColumnBlock'}),
        defineArrayMember({type: 'threeColumnBlock'}),
        defineArrayMember({type: 'alternatingContentBlock'}),
        defineArrayMember({type: 'sectionTitleBlock'}),
        defineArrayMember({type: 'roomSearchFormBlock'}),
        defineArrayMember({type: 'galleryStripBlock'}),
        defineArrayMember({type: 'autoCollageBlock'}),
        defineArrayMember({type: 'testimonialGalleryBlock'}),
      ],
    }),
  ],
})
