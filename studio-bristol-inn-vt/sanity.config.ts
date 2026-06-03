import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const HOMEPAGE_ID = '6e561f5f-23ec-49fa-863f-141c005904c3'
const SETTINGS_ID = 'settings-singleton'

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
              .id(HOMEPAGE_ID)
              .child(
                S.document()
                  .schemaType('homepage')
                  .documentId(HOMEPAGE_ID)
              ),
            S.divider(),
            S.listItem()
              .title('Settings')
              .id(SETTINGS_ID)
              .child(
                S.document()
                  .schemaType('settings')
                  .documentId(SETTINGS_ID)
              ),
            S.divider(),
            S.documentTypeListItem('page').title('Pages'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
