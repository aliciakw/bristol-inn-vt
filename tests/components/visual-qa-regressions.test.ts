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
    announcementBar: {
      announcementBarIsEnabled: true,
      cacheKey: 'persistent-notice',
      body: [
        {
          _type: 'block',
          _key: 'persistent-notice-copy',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: 'copy', text: 'Important notice', marks: [] }],
        },
      ],
      isDismissable: false,
    },
  }),
}));

import DoubleHeroBlock from '../../src/components/home/DoubleHeroBlock.astro';
import AnnouncementBar from '../../src/components/AnnouncementBar.astro';
import Footer from '../../src/components/Footer.astro';
import NavigationTopBar from '../../src/components/NavigationTopBar.astro';
import TestimonialGalleryBlock from '../../src/components/blocks/TestimonialGalleryBlock.astro';
import TestimonialCard from '../../src/components/home/TestimonialCard.astro';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

describe('visual QA regressions', () => {
  test('a non-dismissable announcement renders outside the sticky navigation container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Test page' },
    });

    const announcementIndex = html.indexOf('data-announcement-bar');
    const stickyNavigationIndex = html.indexOf('class="sticky top-0');

    expect(announcementIndex).toBeGreaterThan(-1);
    expect(stickyNavigationIndex).toBeGreaterThan(announcementIndex);
  });

  test('only a non-dismissable announcement stays above the navigation drawer', async () => {
    const container = await AstroContainer.create();
    const body = [
      {
        _type: 'block',
        _key: 'announcement-copy',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 'copy', text: 'Important notice', marks: [] }],
      },
    ];

    const dismissable = await container.renderToString(AnnouncementBar, {
      props: {
        announcement: {
          announcementBarIsEnabled: true,
          cacheKey: 'dismissable-notice',
          body,
          isDismissable: true,
        },
      },
    });
    const persistent = await container.renderToString(AnnouncementBar, {
      props: {
        announcement: {
          announcementBarIsEnabled: true,
          cacheKey: 'persistent-notice',
          body,
          isDismissable: false,
        },
      },
    });

    expect(dismissable).toMatch(/<aside[^>]*class="[^"]*z-20/);
    expect(persistent).toMatch(/<aside[^>]*class="[^"]*z-40/);
  });

  test('the visible homepage badge provides the page-level heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DoubleHeroBlock, {
      props: { showLogoBadge: true },
    });

    expect(html).toMatch(/<h1[^>]*id="bristol-badge"/);
    expect(html).toContain('alt="Bristol Inn Vermont — Settle In. Stay Awhile."');
  });

  test('testimonial carousel uses one vertically centered arrow in each direction with autoplay off', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialGalleryBlock, {
      props: {
        items: [
          { _type: 'testimonialItem', _key: 'one', quote: 'First stay', author: 'Ada', role: 'Guest' },
          { _type: 'testimonialItem', _key: 'two', quote: 'Second stay', author: 'Grace', role: 'Guest' },
        ],
      },
    });

    expect(html.match(/data-testimonials-prev/g)).toHaveLength(1);
    expect(html.match(/data-testimonials-next/g)).toHaveLength(1);
    expect(html).toMatch(/<div[^>]*class="[^"]*flex[^"]*justify-center[^"]*desktop:contents[^"]*"[^>]*data-testimonials-controls/);
    expect(html).toMatch(/<button[^>]*class="[^"]*desktop:absolute[^"]*desktop:-left-26[^"]*desktop:top-1\/2[^"]*"[^>]*data-testimonials-prev/);
    expect(html).toMatch(/<button[^>]*data-testimonials-prev[^>]*data-testimonials-pristine/);
    expect(html).toMatch(/<button[^>]*class="[^"]*desktop:absolute[^"]*desktop:-right-26[^"]*desktop:top-1\/2[^"]*"[^>]*data-testimonials-next/);
    expect(html.match(/<svg[^>]*class="[^"]*size-10/g)).toHaveLength(2);
    expect(html).toContain('TestimonialGallery__Clip');
    expect(html).toContain('TestimonialGallery__Viewport');
    expect(html).not.toContain('data-testimonials-dot');
    expect(html).not.toContain('data-testimonials-toggle');
    expect(html).toContain('data-testimonials-autoplay="false"');
  });

  test('testimonial cards increase quote and attribution type on mobile only', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { quote: 'A lovely stay.', author: 'Ada', role: 'Verified guest' },
    });

    expect(html).toContain('TestimonialCard__Quote');
    expect(html).toContain('--testimonial-mobile-quote-size: 1.5rem');
    expect(html).toContain('TestimonialCard__Author');
    expect(html).toContain('TestimonialCard__Role');
  });

  test('testimonial carousel only renders play and pause when autoplay is enabled', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialGalleryBlock, {
      props: {
        autoplay: true,
        items: [
          { _type: 'testimonialItem', _key: 'one', quote: 'First stay', author: 'Ada', role: 'Guest' },
          { _type: 'testimonialItem', _key: 'two', quote: 'Second stay', author: 'Grace', role: 'Guest' },
        ],
      },
    });

    expect(html).toContain('data-testimonials-autoplay="true"');
    expect(html.match(/data-testimonials-toggle/g)).toHaveLength(2);
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
