type PreviewDocument = {
  _type?: string
  slug?: {
    current?: string
  }
}

type PreviewUrlOptions = {
  refreshKey?: string
  secret?: string
  studioUrl?: string
  siteUrl?: string
}

const DEFAULT_SITE_URL = 'https://bristol-inn-vt.alicia-willett.workers.dev'

const LOCAL_HOSTNAMES = new Set(['127.0.0.1', '::1', 'localhost'])

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function isLocalUrl(value: string): boolean {
  try {
    return LOCAL_HOSTNAMES.has(new URL(value).hostname)
  } catch {
    return false
  }
}

export function resolvePreviewSiteUrl(siteUrl?: string, studioUrl?: string): string {
  if (!siteUrl) {
    return DEFAULT_SITE_URL
  }

  if (isLocalUrl(siteUrl) && studioUrl && !isLocalUrl(studioUrl)) {
    return DEFAULT_SITE_URL
  }

  return siteUrl
}

export function resolvePreviewPath(document: PreviewDocument): string | null {
  if (document._type === 'homepage') {
    return '/preview'
  }

  if (document._type === 'contactPage') {
    return '/preview/contact'
  }

  if (document._type === 'page' && document.slug?.current) {
    return `/preview/${document.slug.current}`
  }

  return null
}

export function buildPreviewUrl(
  document: PreviewDocument,
  options: PreviewUrlOptions = {},
): string | null {
  const path = resolvePreviewPath(document)

  if (!path || !options.secret) {
    return null
  }

  const siteUrl = resolvePreviewSiteUrl(options.siteUrl, options.studioUrl)
  const url = new URL(path, trimTrailingSlash(siteUrl))
  url.searchParams.set('secret', options.secret)

  if (options.refreshKey) {
    url.searchParams.set('studioPreview', options.refreshKey)
  }

  return url.toString()
}
