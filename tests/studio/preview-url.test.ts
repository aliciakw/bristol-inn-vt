import { describe, expect, it } from 'vitest';
import { buildPreviewUrl, resolvePreviewPath } from '../../studio-bristol-inn-vt/lib/previewUrl';

describe('resolvePreviewPath()', () => {
  it('resolves the homepage singleton to /preview', () => {
    expect(resolvePreviewPath({ _type: 'homepage' })).toBe('/preview');
  });

  it('resolves the contact singleton to /preview/contact', () => {
    expect(resolvePreviewPath({ _type: 'contactPage' })).toBe('/preview/contact');
  });

  it('resolves generic pages from slug.current', () => {
    expect(resolvePreviewPath({ _type: 'page', slug: { current: 'rooms-and-suites' } })).toBe('/preview/rooms-and-suites');
  });

  it('returns null when a generic page is missing a slug', () => {
    expect(resolvePreviewPath({ _type: 'page' })).toBeNull();
  });
});

describe('buildPreviewUrl()', () => {
  it('adds the shared preview secret as a query parameter', () => {
    expect(buildPreviewUrl({ _type: 'page', slug: { current: 'about' } }, { siteUrl: 'https://www.example.com/', secret: 'shared-secret' })).toBe(
      'https://www.example.com/preview/about?secret=shared-secret',
    );
  });

  it('returns null without a secret', () => {
    expect(buildPreviewUrl({ _type: 'homepage' }, { siteUrl: 'https://www.example.com' })).toBeNull();
  });
});
