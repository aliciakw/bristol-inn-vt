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
      description: 'Up to 4 photos shown in a full-width strip.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
        }),
      ],
      validation: (Rule) => Rule.max(10),
    }),

    // Reservation section
    defineField({ name: 'reservationHeading', title: 'Reservation Heading', type: 'string' }),
    defineField({ name: 'reservationDescription', title: 'Reservation Description', type: 'text', rows: 4 }),
    defineField({
      name: 'reservationImage',
      title: 'Reservation Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),

    // Testimonial (compound object, like meta)
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'object',
      fields: [
        defineField({ name: 'quote', type: 'text', title: 'Quote', rows: 3 }),
        defineField({ name: 'author', type: 'string', title: 'Author' }),
        defineField({ name: 'role', type: 'string', title: 'Role', description: 'e.g. "Verified guest"' }),
      ],
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
      title: 'Body',
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
