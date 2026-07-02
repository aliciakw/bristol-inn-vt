interface ImportMetaEnv {
  readonly SANITY_STUDIO_DEPLOY_API_URL?: string
  readonly SANITY_STUDIO_DEPLOY_TRIGGER_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
