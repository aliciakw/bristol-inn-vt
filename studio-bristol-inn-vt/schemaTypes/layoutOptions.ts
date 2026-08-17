import {defineField} from 'sanity'
import {colorFields} from './colorFields'

export const layoutOptionsFieldset = {
  name: 'layoutOptions',
  title: 'Layout Options',
  options: {collapsible: true, collapsed: true},
}

const spacerOptions = [
  {title: 'None', value: 'none'},
  {title: 'Small', value: 'sm'},
  {title: 'Medium', value: 'md'},
  {title: 'Large', value: 'lg'},
  {title: 'Extra Large', value: 'xl'},
]

export const layoutOptionFields = [
  defineField({
    name: 'topSpacer',
    title: 'Top spacer',
    type: 'string',
    fieldset: 'layoutOptions',
    initialValue: 'sm',
    options: {list: spacerOptions},
  }),
  defineField({
    name: 'bottomSpacer',
    title: 'Bottom spacer',
    type: 'string',
    fieldset: 'layoutOptions',
    initialValue: 'sm',
    options: {list: spacerOptions},
  }),
  ...colorFields.map((field) => ({...field, fieldset: 'layoutOptions'})),
]
