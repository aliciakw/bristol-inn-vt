import { defineField } from "sanity";
import { ColorSwatchInput } from "./ColorSwatchInput";

export const colorFields = [
  defineField({
    name: 'backgroundColor',
    title: 'Background Color Override',
    description: 'Only include if you want to override the default background color for this block.',
    type: 'string',
    components: { input: ColorSwatchInput },
  }),
  defineField({
    name: 'textColor',
    title: 'Text Color Override',
    description: 'Only include if you want to override the default text color for this block.',
    type: 'string',
    components: { input: ColorSwatchInput },
  }),
];