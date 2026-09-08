/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../../src/lib/sanity', () => ({
  buildSanityImageUrl: (url: string) => url,
  getSettings: async () => ({
    footerSections: [
      {
        title: 'Information',
        content: [
          {
            _type: 'block',
            _key: 'empty-heading',
            style: 'h4',
            markDefs: [],
            children: [{ _type: 'span', _key: 'empty-span', text: '', marks: [] }],
          },
        ],
      },
    ],
    hideNewsletterSubscriptionForm: true,
  }),
}));

import DoubleHeroBlock from '../../src/components/home/DoubleHeroBlock.astro';
import Footer from '../../src/components/Footer.astro';
import NavigationTopBar from '../../src/components/NavigationTopBar.astro';
import TestimonialGalleryBlock from '../../src/components/blocks/TestimonialGalleryBlock.astro';

describe('visual QA regressions', () => {
  test('the visible homepage badge provides the page-level heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DoubleHeroBlock, {
      props: { showLogoBadge: true },
    });

    expect(html).toMatch(/<h1[^>]*id="bristol-badge"/);
    expect(html).toContain('alt="Bristol Inn Vermont — Settle In. Stay Awhile."');
  });

  test('testimonial pagination uses large hit areas around small indicators', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialGalleryBlock, {
      props: {
        items: [
          { _type: 'testimonialItem', _key: 'one', quote: 'First stay', author: 'Ada', role: 'Guest' },
          { _type: 'testimonialItem', _key: 'two', quote: 'Second stay', author: 'Grace', role: 'Guest' },
        ],
      },
    });

    const dotButtons = html.match(/<button[^>]*data-testimonials-dot[^>]*>/g) ?? [];
    expect(dotButtons).toHaveLength(2);
    expect(dotButtons.every((button) => button.includes('size-11'))).toBe(true);
    expect(html.match(/data-testimonials-dot-indicator/g)).toHaveLength(2);
  });

  test('the footer omits empty CMS heading blocks', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);

    expect(html).not.toMatch(/<h4[^>]*>\s*<\/h4>/);
  });

  test('the closed navigation drawer is excluded from keyboard interaction', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavigationTopBar, {
      props: { variant: 'white' },
    });

    expect(html).toMatch(/<nav[^>]*id="nav-menu"[^>]*inert/);
  });
});
