import { defineField } from "sanity";
import { ColorSwatchInput } from "./ColorSwatchInput";

export function defineBackgroundColorField(
  name = 'backgroundColor',
  title = 'Background Color Override',
  description = 'Only include if you want to override the default background color for this block.'
) {
  return defineField({
    name,
    title,
    description,
    type: 'string',
    components: { input: ColorSwatchInput },
  })
}
export function defineTextColorField(
  name = 'textColor',
  title = 'Text Color Override',
  description = 'Only include if you want to override the default text color for this block.'
) {
  return defineField({
    name,
    title,
    description,
    type: 'string',
    components: { input: ColorSwatchInput },
  })
}

export const colorFields = [
  // defineColorField(),
  defineBackgroundColorField(),
  defineTextColorField(),
  // defineField({
  //   name: 'backgroundColor',
  //   title: 'Background Color Override',
  //   description: 'Only include if you want to override the default background color for this block.',
  //   type: 'string',
  //   components: { input: ColorSwatchInput },
  // }),
  // defineField({
  //   name: 'textColor',
  //   title: 'Text Color Override',
  //   description: 'Only include if you want to override the default text color for this block.',
  //   type: 'string',
  //   components: { input: ColorSwatchInput },
  // }),
];