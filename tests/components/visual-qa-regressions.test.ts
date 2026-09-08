/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';

import DoubleHeroBlock from '../../src/components/home/DoubleHeroBlock.astro';
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
});
