import { defineType, defineField, defineArrayMember } from 'sanity'

export const faqItemType = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string' }),
    defineField({ name: 'answer', title: 'Answer', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
  ],
  preview: {
    select: {
      question: 'question',
      answer: 'answer',
    },
    prepare({ question, answer }) {
      const answerText = answer?.map((block: any) => block.children?.map((child: any) => child.text).join('')).join('\n').slice(0, 75);
      return { title: question, subtitle: answerText ?? '(blank)' }
    },
  },
});

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'items', title: 'Items', type: 'array', of: [defineArrayMember({ name: 'faqItem', title: 'FAQ Item', type: 'faqItem' })] }),
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({ title,items }) {
      return { title: title ?? '(no title)', subtitle: items?.length ?? 0 }
    },
  },
});
