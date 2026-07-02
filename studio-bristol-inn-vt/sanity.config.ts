import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {schemaTypes} from './schemaTypes'
import {DeployTool} from './deploy/DeployTool'

const HOMEPAGE_ID = '6e561f5f-23ec-49fa-863f-141c005904c3'
const CONTACT_PAGE_ID = 'contact-page-singleton'
const SETTINGS_ID = 'settings-singleton'
const FAQ_ID = 'faq-singleton'
const PAGE_SINGLETON_TYPES = ['homepage', 'contactPage']

export default defineConfig({
  name: 'default',
  title: 'bristol-inn-vt',

  projectId: '4rk27ty6',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Pages')
              .id('pages')
              .child(
                S.documentList()
                  .title('Pages')
                  .filter('_type in $pageTypes')
                  .params({pageTypes: ['homepage', 'contactPage', 'page']}),
              ),
            S.divider(),
            S.listItem()
              .title('FAQ')
              .id(FAQ_ID)
              .child(S.document().schemaType('faq').documentId(FAQ_ID)),
            S.divider(),
            S.listItem()
              .title('Settings')
              .id(SETTINGS_ID)
              .child(S.document().schemaType('settings').documentId(SETTINGS_ID)),
          ]),
    }),
    visionTool(),
    colorInput(),
  ],

  tools: (prev) => [
    ...prev,
    {
      name: 'deploy',
      title: 'Deploy',
      component: DeployTool,
    },
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, {schemaType}) => {
      if (!PAGE_SINGLETON_TYPES.includes(schemaType)) {
        return prev
      }

      return prev.filter(({action}) => action !== 'delete' && action !== 'duplicate')
    },
    newDocumentOptions: (prev) =>
      prev.filter(({templateId}) => !PAGE_SINGLETON_TYPES.includes(templateId)),
  },
})
