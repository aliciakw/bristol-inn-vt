import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '4rk27ty6',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
    /**
     * Fixed hostname so `sanity deploy` is non-interactive (required for CI).
     * Studio is served at https://bristol-inn-vt.sanity.studio
     */
     appId: 'uohr1he29r48yf25fvkvcfj5'
  }
})
