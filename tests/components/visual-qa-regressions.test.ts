/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';

import DoubleHeroBlock from '../../src/components/home/DoubleHeroBlock.astro';

describe('visual QA regressions', () => {
  test('the visible homepage badge provides the page-level heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DoubleHeroBlock, {
      props: { showLogoBadge: true },
    });

    expect(html).toMatch(/<h1[^>]*id="bristol-badge"/);
    expect(html).toContain('alt="Bristol Inn Vermont — Settle In. Stay Awhile."');
  });
});
