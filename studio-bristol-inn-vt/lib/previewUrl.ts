type PreviewDocument = {
  _type?: string;
  slug?: {
    current?: string;
  };
};

type PreviewUrlOptions = {
  refreshKey?: string;
  secret?: string;
  siteUrl?: string;
};

const DEFAULT_SITE_URL = 'https://bristol-inn-vt.sanity.studio/';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function resolvePreviewPath(document: PreviewDocument): string | null {
  if (document._type === 'homepage') {
    return '/preview';
  }

  if (document._type === 'contactPage') {
    return '/preview/contact';
  }

  if (document._type === 'page' && document.slug?.current) {
    return `/preview/${document.slug.current}`;
  }

  return null;
}

export function buildPreviewUrl(document: PreviewDocument, options: PreviewUrlOptions = {}): string | null {
  const path = resolvePreviewPath(document);

  if (!path || !options.secret) {
    return null;
  }

  const url = new URL(path, trimTrailingSlash(options.siteUrl ?? DEFAULT_SITE_URL));
  url.searchParams.set('secret', options.secret);

  if (options.refreshKey) {
    url.searchParams.set('studioPreview', options.refreshKey);
  }

  return url.toString();
}
