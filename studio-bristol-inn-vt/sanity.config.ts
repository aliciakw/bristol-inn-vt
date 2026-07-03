import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {media} from 'sanity-plugin-media'

import {schemaTypes} from './schemaTypes'
import {DeployTool} from './deploy/DeployTool'
import {MobilePagePreviewPane, PagePreviewPane} from './components/PagePreviewPane'

const HOMEPAGE_ID = '6e561f5f-23ec-49fa-863f-141c005904c3'
const CONTACT_PAGE_ID = 'contact-page-singleton'
const SETTINGS_ID = 'settings-singleton'
const FAQ_ID = 'faq-singleton'
const PAGE_SINGLETON_TYPES = ['homepage', 'contactPage']

const pageDocument = (S: any, documentId: string, schemaType: string) =>
  S.document()
    .documentId(documentId)
    .schemaType(schemaType)
    .views([
      S.view.form(),
      S.view.component(PagePreviewPane).title('Preview'),
      S.view.component(MobilePagePreviewPane).title('Mobile Preview'),
    ])

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
                S.list()
                  .title('Pages')
                  .items([
                    S.listItem()
                      .title('Homepage')
                      .id(HOMEPAGE_ID)
                      .child(pageDocument(S, HOMEPAGE_ID, 'homepage')),
                    S.listItem()
                      .title('Contact Page')
                      .id(CONTACT_PAGE_ID)
                      .child(pageDocument(S, CONTACT_PAGE_ID, 'contactPage')),
                    S.documentTypeListItem('page')
                      .title('Pages')
                      .child(
                        S.documentTypeList('page')
                          .title('Pages')
                          .child((documentId: string) => pageDocument(S, documentId, 'page')),
                      ),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title('FAQ')
              .id(FAQ_ID)
              .child(S.document().schemaType('faq').documentId(FAQ_ID)),
            S.divider(),
            S.listItem()
              .title('Rooms')
              .id('rooms')
              .child(
                S.documentList()
                  .title('Rooms')
                  .filter('_type == "room"')
              ),
            S.divider(),
            S.listItem()
              .title('Settings')
              .id(SETTINGS_ID)
              .child(S.document().schemaType('settings').documentId(SETTINGS_ID)),
          ]),
    }),
    visionTool(),
    media(),
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
