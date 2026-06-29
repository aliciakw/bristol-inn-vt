import {defineType, defineField, defineArrayMember} from 'sanity'

export const contactPageType = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO / OG'},
  ],
  fields: [
    defineField({
      name: 'meta',
      title: 'Page Meta',
      type: 'meta',
      description: 'For SEO and social media.',
      group: 'seo',
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Heading', value: 'h1'},
            {title: 'Subheading', value: 'h2'},
            {title: 'Paragraph', value: 'normal'},
          ],
          lists: [],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      group: 'content',
    }),
    defineField({
      name: 'directionsLink',
      title: 'Directions Link',
      type: 'link',
      group: 'content',
    }),
    defineField({
      name: 'googleMapEmbedUrl',
      title: 'Google Map Embed URL',
      description: 'Use the src URL from a Google Maps embed iframe.',
      type: 'url',
      group: 'content',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Contact Page'}
    },
  },
})
