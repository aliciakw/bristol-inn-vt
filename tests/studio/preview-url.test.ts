import { describe, expect, it } from 'vitest';
import { buildPreviewUrl, resolvePreviewPath, resolvePreviewSiteUrl } from '../../studio-bristol-inn-vt/lib/previewUrl';

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

  it('adds an optional refresh key for remounting iframe previews after saves', () => {
    expect(buildPreviewUrl({ _type: 'page', slug: { current: 'about' } }, { refreshKey: 'draft-revision', siteUrl: 'https://www.example.com/', secret: 'shared-secret' })).toBe(
      'https://www.example.com/preview/about?secret=shared-secret&studioPreview=draft-revision',
    );
  });

  it('returns null without a secret', () => {
    expect(buildPreviewUrl({ _type: 'homepage' }, { siteUrl: 'https://www.example.com' })).toBeNull();
  });

  it('falls back to the deployed website without a site URL override', () => {
    expect(buildPreviewUrl({ _type: 'homepage' }, { secret: 'shared-secret' })).toBe('https://bristol-inn-vt.alicia-willett.workers.dev/preview?secret=shared-secret');
  });
});

describe('resolvePreviewSiteUrl()', () => {
  it('keeps localhost when the Studio is also running locally', () => {
    expect(resolvePreviewSiteUrl('http://localhost:4321', 'http://localhost:3333/structure')).toBe('http://localhost:4321');
  });

  it('replaces localhost when the Studio is deployed', () => {
    expect(resolvePreviewSiteUrl('http://localhost:4321', 'https://bristol-inn-vt.sanity.studio/structure')).toBe('https://bristol-inn-vt.alicia-willett.workers.dev');
  });
});
