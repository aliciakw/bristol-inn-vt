import {defineField, defineType} from 'sanity'

type TestimonialPreviewSelection = {
  quote?: string
  author?: string
  role?: string
}

const truncatePreviewText = (text: string) => {
  if (text.length <= 80) {
    return text
  }

  return `${text.slice(0, 77).trim()}...`
}

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      description: 'e.g. "Verified guest"',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      quote: 'quote',
      author: 'author',
      role: 'role',
    },
    prepare({quote, author, role}: TestimonialPreviewSelection) {
      return {
        title: author?.trim() || 'Testimonial',
        subtitle: role?.trim() || (quote ? truncatePreviewText(quote) : undefined),
      }
    },
  },
})
