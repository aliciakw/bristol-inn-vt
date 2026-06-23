import { createClient, type SanityClient } from '@sanity/client';
import { SANITY_API_TOKEN } from 'astro:env/server';

export type SanityImageUrlOptions = {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'crop' | 'clip' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
};

export function buildSanityImageUrl(url: string, options: SanityImageUrlOptions = {}): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  const params = new URLSearchParams({ auto: 'format' });
  if (options.width) params.set('w', String(options.width));
  if (options.height) params.set('h', String(options.height));
  if (options.quality !== undefined) params.set('q', String(options.quality));
  if (options.fit) params.set('fit', options.fit);
  return `${url}?${params.toString()}`;
}

const PROJECT_ID = '4rk27ty6';
const DATASET = 'production';
const API_VERSION = '2025-06-02';

let _client: SanityClient | null = null;

export function getClient(): SanityClient {
  if (_client) return _client;
  _client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: true,
    token: SANITY_API_TOKEN,
  });
  return _client;
}

export type SanityBlock = { _type: string; _key: string; [key: string]: unknown };

export type SanityMeta = {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: { url: string };
};

export type SanityResolvedLink = {
  label: string;
  href: string;
  openInNewTab: boolean;
};

export type SanityImage = {
  url: string;
  alt: string;
  caption?: string;
  layout?: 'default' | 'square' | 'fullbleed';
  rounded?: boolean;
};

export type SanityTestimonialItem = {
  _type: 'testimonialItem';
  _key: string;
  quote: string;
  author: string;
  role: string;
};

export type SanityTestimonialImageItem = {
  _type: 'image';
  _key: string;
  url: string;
  alt: string;
};

export type SanityTestimonialArrayItem = SanityTestimonialItem | SanityTestimonialImageItem;

export type SanityHomepage = {
  coverColor?: string;
  welcomeHeading?: string;
  welcomeDescription?: string;
  welcomeCTA?: SanityResolvedLink;
  heroLeftImage?: SanityImage;
  heroRightImage?: SanityImage;
  welcomeImage?: SanityImage;
  galleryImages: SanityImage[];
  reservationHeading?: string;
  reservationHeadingIcon?: SanityImage;
  reservationDescription?: string;
  reservationImage?: SanityImage;
  testimonialsHeading?: string;
  testimonial?: SanityTestimonialArrayItem[];
  amenities: string[];
  body: SanityBlock[];
};

export type SanityPageHeader = {
  introduction?: SanityBlock[];
  heroImage?: SanityImage;
  textColor?: string;
  backgroundColor?: string;
};

export type SanityPage = {
  title: string;
  pageHeader?: SanityPageHeader;
  meta?: SanityMeta;
  body: SanityBlock[];
  uid: string;
};

const HOMEPAGE_ID = '6e561f5f-23ec-49fa-863f-141c005904c3';

const RESOLVE_LINK = `{ label, "href": select(linkType == "internal" => "/" + internalLink->slug.current, url), "openInNewTab": coalesce(openInNewTab, false) }`;

const RESOLVE_BUTTON_LINK = `{ label, color, "href": select(linkType == "internal" => "/" + internalLink->slug.current, url), "openInNewTab": coalesce(openInNewTab, false) }`;

const RESOLVE_COLUMN_ITEM = `{
  ...,
  "image": image{ "url": image.asset->url, "alt": coalesce(alt, ""), caption, layout, "rounded": coalesce(rounded, false) },
  "cta": cta${RESOLVE_LINK}
}`;

const RESOLVE_BODY_ITEM = `{
  ...,
  _type == "imageBlock" => { ..., "image": image{ "url": asset->url, "alt": coalesce(alt, "") } },
  _type == "singleImageBlock" => { ..., "image": image{ "url": asset->url, "alt": coalesce(alt, "") } },
  _type == "pageHeaderBlock" => { ..., "heroImage": heroImage{ "url": asset->url, "alt": coalesce(alt, "") } },
  _type == "ctaBlock" => { ..., "cta": cta${RESOLVE_LINK} },
  _type == "singleColumnBlock" => { ..., "column1": column1${RESOLVE_COLUMN_ITEM} },
  _type == "twoColumnBlock" => { ..., "column1": column1${RESOLVE_COLUMN_ITEM}, "column2": column2${RESOLVE_COLUMN_ITEM} },
  _type == "threeColumnBlock" => { ..., "column1": column1${RESOLVE_COLUMN_ITEM}, "column2": column2${RESOLVE_COLUMN_ITEM}, "column3": column3${RESOLVE_COLUMN_ITEM} }
}`;

export async function getHomepage(): Promise<SanityHomepage> {
  return getClient().fetch<SanityHomepage>(
    `*[_type == "homepage" && _id == $id][0]{
      coverColor,
      welcomeHeading,
      welcomeDescription,
      "welcomeCTA": welcomeCTA${RESOLVE_LINK},
      "heroLeftImage": heroLeftImage{ "url": asset->url, "alt": coalesce(alt, "") },
      "heroRightImage": heroRightImage{ "url": asset->url, "alt": coalesce(alt, "") },
      "welcomeImage": welcomeImage{ "url": asset->url, "alt": coalesce(alt, "") },
      "galleryImages": galleryImages[]{ "url": asset->url, "alt": coalesce(alt, "") },
      reservationHeading,
      "reservationHeadingIcon": reservationHeadingIcon{ "url": asset->url, "alt": coalesce(alt, "") },
      reservationDescription,
      "reservationImage": reservationImage{ "url": asset->url, "alt": coalesce(alt, "") },
      testimonialsHeading,
      "testimonial": testimonial[]{
        _type,
        _key,
        _type == "testimonialItem" => { quote, author, role },
        _type == "image" => { "url": asset->url, "alt": coalesce(alt, "") }
      },
      "amenities": coalesce(amenities, []),
      "body": body[]${RESOLVE_BODY_ITEM}
    }`,
    { id: HOMEPAGE_ID },
  );
}

export async function getPage(slug: string): Promise<SanityPage> {
  return getClient().fetch<SanityPage>(
    `*[_type == "page" && slug.current == $slug][0]{
      title,
      "pageHeader": pageHeader{
        introduction,
        "heroImage": heroImage{ "url": asset->url, "alt": coalesce(alt, "") },
        textColor,
        backgroundColor
      },
      "meta": meta{
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->{ "url": url }
      },
      "body": body[]${RESOLVE_BODY_ITEM},
      "uid": slug.current
    }`,
    { slug },
  );
}

export async function getPages(): Promise<Pick<SanityPage, 'uid'>[]> {
  return getClient().fetch<Pick<SanityPage, 'uid'>[]>(`*[_type == "page"]{ "uid": slug.current }`);
}

export type SanityFaqItem = {
  _key: string;
  faqId: string;
  question: string;
  answer: SanityBlock[];
};

export type SanityFaq = {
  title?: string;
  description?: string;
  items: SanityFaqItem[];
};

export async function getFaq(): Promise<SanityFaq | null> {
  return getClient().fetch<SanityFaq | null>(
    `*[_type == "faq"][0]{
      title,
      description,
      "items": items[]{
        _key,
        question,
        answer,
        "faqId": id.current
      }
    }`,
  );
}

export type SanityLink = {
  label: string;
  href: string; // resolved from url or internalLink slug
  openInNewTab: boolean;
};

export type SanityFooterSection = {
  title: string;
  content: SanityBlock[];
};

export type SanityAwardImage = {
  url: string;
  alt: string;
  linkUrl?: string;
};

export type SanityButtonLink = {
  label: string;
  color?: string;
  href: string;
  openInNewTab: boolean;
};

export type SanitySettings = {
  meta?: SanityMeta;
  nameplateLogo?: string;
  leftCta?: SanityButtonLink;
  rightCta?: SanityButtonLink;
  sidebarLinks: SanityLink[];
  footerSections: SanityFooterSection[];
  awardImages: SanityAwardImage[];
  directionsLink: SanityLink | null;
};

const SETTINGS_ID = 'settings-singleton';

export async function getSettings(): Promise<SanitySettings> {
  return getClient().fetch<SanitySettings>(
    `*[_type == "settings" && _id == $id][0]{
      "meta": meta{
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->{ "url": url }
      },
      "nameplateLogo": nameplateLogo.asset->url,
      "leftCta": leftCta${RESOLVE_BUTTON_LINK},
      "rightCta": rightCta${RESOLVE_BUTTON_LINK},
      "sidebarLinks": sidebarLinks[]{
        label,
        "href": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          url
        ),
        "openInNewTab": coalesce(openInNewTab, false)
      },
      "footerSections": footerSections[]{
        title,
        content
      },
      "awardImages": awardImages[]{
        "url": asset->url,
        alt,
        "linkUrl": url
      },
      "directionsLink": directionsLink{
        label,
        "href": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          url
        ),
        "openInNewTab": coalesce(openInNewTab, false)
      }
    }`,
    { id: SETTINGS_ID },
  );
}
