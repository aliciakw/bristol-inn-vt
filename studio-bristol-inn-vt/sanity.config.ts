import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {CaseIcon} from '@sanity/icons/Case'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentsIcon} from '@sanity/icons/Documents'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {HomeIcon} from '@sanity/icons/Home'
import {media} from 'sanity-plugin-media'

import {schemaTypes} from './schemaTypes'
import {DeployTool} from './deploy/DeployTool'
import {OpenPreviewAction} from './components/OpenPreviewAction'
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
              .title('Homepage')
              .icon(HomeIcon)
              .id(HOMEPAGE_ID)
              .child(pageDocument(S, HOMEPAGE_ID, 'homepage')),
            S.listItem()
              .title('Contact Page')
              .icon(EnvelopeIcon)
              .id(CONTACT_PAGE_ID)
              .child(pageDocument(S, CONTACT_PAGE_ID, 'contactPage')),
            S.documentTypeListItem('page')
              .title('Other Pages')
              .icon(DocumentsIcon)
              .child(
                S.documentTypeList('page')
                  .title('Other Pages')
                  .child((documentId: string) => pageDocument(S, documentId, 'page')),
              ),
            S.divider(),
            S.listItem()
              .title('FAQ: Questions & Answers')
              .icon(HelpCircleIcon)
              .id(FAQ_ID)
              .child(S.document().schemaType('faq').documentId(FAQ_ID)),
            S.divider(),
            S.listItem()
              .title('Rooms')
              .icon(CaseIcon)
              .id('rooms')
              .child(S.documentList().title('Rooms').filter('_type == "room"')),
            S.divider(),
            S.listItem()
              .title('Settings')
              .icon(CogIcon)
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
      const isPreviewable = [...PAGE_SINGLETON_TYPES, 'page'].includes(schemaType)
      const actions = isPreviewable ? [...prev, OpenPreviewAction] : prev

      if (!PAGE_SINGLETON_TYPES.includes(schemaType)) {
        return actions
      }

      return actions.filter(({action}) => action !== 'delete' && action !== 'duplicate')
    },
    newDocumentOptions: (prev) =>
      prev.filter(({templateId}) => !PAGE_SINGLETON_TYPES.includes(templateId)),
  },
})
