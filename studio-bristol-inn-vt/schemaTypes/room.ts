import {defineArrayMember, defineField, defineType} from 'sanity'

type RoomPreviewSelection = {
  name?: string
  hostawayId?: number
  floor?: number
}

export const roomType = defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  fields: [
    defineField({
      name: 'hostawayId',
      title: 'Hostaway ID',
      type: 'number',
      description: 'The Hostaway listing ID this CMS room decorates.',
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'floor',
      title: 'Floor',
      type: 'number',
      options: {
        list: [
          {title: '1', value: 1},
          {title: '2', value: 2},
          {title: '3', value: 3},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().integer().min(1).max(3),
    }),
    defineField({
      name: 'specialInstructions',
      title: 'Special Instructions',
      type: 'array',
      description: 'Optional room-specific notes shown on the room detail page.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      name: 'name',
      hostawayId: 'hostawayId',
      floor: 'floor',
    },
    prepare({name, hostawayId, floor}: RoomPreviewSelection) {
      const subtitle = [
        hostawayId ? `Hostaway ${hostawayId}` : undefined,
        floor ? `Floor ${floor}` : undefined,
      ]
        .filter(Boolean)
        .join(' - ')

      return {
        title: name ?? 'Room',
        subtitle,
      }
    },
  },
})
