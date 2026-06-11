import { defineType, defineField, defineArrayMember } from 'sanity'

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
          title: 'Image Block',
          fields: [
            defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Full Width', value: 'full' }, { title: 'Contained', value: 'contained' }] },
            }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA Block',
          fields: [
            defineField({ name: 'cta', type: 'link', title: 'Button' }),
          ],
          preview: {
            select: { label: 'cta.label' },
            prepare({ label }: { label?: string }) {
              return { title: label ?? '(no label)', subtitle: 'CTA Block' }
            },
          },
        }),
      ],
    }),
  ],
})
