interface ImportMetaEnv {
  readonly SANITY_STUDIO_DEPLOY_API_URL?: string
  readonly SANITY_STUDIO_DEPLOY_TRIGGER_TOKEN?: string
  readonly SANITY_STUDIO_PREVIEW_SECRET?: string
  readonly SANITY_STUDIO_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
