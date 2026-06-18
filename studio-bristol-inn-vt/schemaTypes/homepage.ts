import { defineType, defineField, defineArrayMember } from 'sanity'
import { ColorSwatchInput } from './ColorSwatchInput'
import { colorFields } from './colorFields'

const columnItemFields = [
  defineField({
    name: 'body',
    title: 'Body',
    type: 'array',
    of: [defineArrayMember({ type: 'block' })],
  }),
  defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    options: { hotspot: true },
    fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
  }),
  defineField({ name: 'cta', title: 'CTA', type: 'link' }),
];

export const homepageType = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    // Welcome section
    defineField({ name: 'welcomeHeading', title: 'Welcome Heading', type: 'string' }),
    defineField({ name: 'welcomeDescription', title: 'Welcome Description', type: 'text', rows: 3 }),
    defineField({ name: 'welcomeCTA', title: 'Welcome CTA (optional)', type: 'link' }),
    defineField({
      name: 'heroLeftImage',
      title: 'Hero Collage — Left Image',
      description: 'Left panel of the hero collage (e.g. nature or landscape photo).',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),
    defineField({
      name: 'heroRightImage',
      title: 'Hero Collage — Right Image',
      description: 'Right panel of the hero collage (e.g. building exterior photo).',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),
    defineField({
      name: 'welcomeImage',
      title: 'Welcome Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),

    // Gallery strip
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
      description: 'A continuous strip of scrolling images.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
        }),
      ],
      validation: (Rule) => Rule.min(10).max(16),
    }),

    // Reservation section
    defineField({ name: 'reservationHeading', title: 'Reservation Heading', type: 'string' }),
    defineField({ name: 'reservationHeadingIcon', title: 'Reservation Heading Icon', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'reservationDescription', title: 'Reservation Description', type: 'text', rows: 4 }),
    defineField({
      name: 'reservationImage',
      title: 'Reservation Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),

    // Testimonials (array of up to 2 items: testimonial or image)
    defineField({ name: 'testimonialsHeading', title: 'Testimonials Heading', type: 'string' }),
    defineField({
      name: 'testimonial',
      title: 'Testimonials',
      description: 'Up to 3 items — a testimonial quote or an image.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonialItem',
          title: 'Testimonial',
          fields: [
            defineField({ name: 'quote', type: 'text', title: 'Quote', rows: 3 }),
            defineField({ name: 'author', type: 'string', title: 'Author' }),
            defineField({ name: 'role', type: 'string', title: 'Role', description: 'e.g. "Verified guest"' }),
          ],
          preview: {
            select: { quote: 'quote', author: 'author' },
            prepare({ quote, author }: { quote?: string; author?: string }) {
              return { title: author ?? '(no author)', subtitle: quote }
            },
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),

    // Amenities
    defineField({
      name: 'amenities',
      title: 'Popular Amenities',
      description: 'Shown as two columns of bullet points.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),

    // Flexible body (SliceZone)
    defineField({
      name: 'body',
      title: 'Additional Content',
      description: 'Renders below everything else on the homepage. Optional.',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'object',
          name: 'imageBlock',
          title: 'Image Block (legacy)',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
            }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Full Width', value: 'full' }, { title: 'Contained', value: 'contained' }] },
            }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            ...colorFields,
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'singleImageBlock',
          title: 'Image',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
            }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              initialValue: 'default',
              options: { list: [{ title: 'Default', value: 'default' }, { title: 'Full Bleed', value: 'fullbleed' }], layout: 'radio' },
            }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            ...colorFields,
          ],
          preview: {
            select: { media: 'image', caption: 'caption', layout: 'layout' },
            prepare({ media, caption, layout }: { media?: any; caption?: string; layout?: string }) {
              return { title: caption ?? '(no caption)', subtitle: layout ?? 'default', media };
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA Button',
          fields: [
            defineField({ name: 'cta', type: 'link', title: 'Button' }),
            ...colorFields,
          ],
          preview: {
            select: { label: 'cta.label' },
            prepare({ label }: { label?: string }) {
              return { title: label ?? '(no label)', subtitle: 'CTA Block' }
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'pageHeaderBlock',
          title: 'Page Header',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Title' }),
            defineField({
              name: 'introduction',
              title: 'Introduction',
              type: 'array',
              of: [defineArrayMember({ type: 'block' })],
            }),
            defineField({
              name: 'heroImage',
              type: 'image',
              title: 'Hero Image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
            }),
            ...colorFields,
          ],
          preview: {
            select: { title: 'title', media: 'heroImage' },
            prepare({ title, media }: { title?: string; media?: any }) {
              return { title: title ?? '(no title)', subtitle: 'Page Header', media };
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'singleColumnBlock',
          title: 'Single Column',
          fields: [
            defineField({
              name: 'columns',
              title: 'Content',
              type: 'array',
              of: [defineArrayMember({ type: 'object', name: 'columnItem', title: 'Column', fields: columnItemFields })],
              validation: (Rule) => Rule.max(1),
            }),
            ...colorFields,
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'twoColumnBlock',
          title: 'Two Columns',
          fields: [
            defineField({
              name: 'columns',
              title: 'Columns',
              type: 'array',
              of: [defineArrayMember({ type: 'object', name: 'columnItem', title: 'Column', fields: columnItemFields })],
              validation: (Rule) => Rule.max(2),
            }),
            ...colorFields,
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'threeColumnBlock',
          title: 'Three Columns',
          fields: [
            defineField({
              name: 'columns',
              title: 'Columns',
              type: 'array',
              of: [defineArrayMember({ type: 'object', name: 'columnItem', title: 'Column', fields: columnItemFields })],
              validation: (Rule) => Rule.max(3),
            }),
            ...colorFields,
          ],
        }),
      ],
    }),
    defineField({
      name: 'coverColor',
      title: 'Cover Color',
      description: 'Background color of the intro cover that slides away on page load.',
      type: 'string',
      components: {input: ColorSwatchInput},
    }),
  ],
})
