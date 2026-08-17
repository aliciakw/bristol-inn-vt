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
let _previewClient: SanityClient | null = null;

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

export function getPreviewClient(): SanityClient {
  if (_previewClient) return _previewClient;
  _previewClient = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    token: SANITY_API_TOKEN,
    perspective: 'drafts',
  });
  return _previewClient;
}

export type SanityBlock = { _type: string; _key: string; [key: string]: unknown };

export type SanityPreviewLabel = 'Preview' | 'Live Site';

export type SanityPreviewResult<T> = {
  data: T | null;
  label: SanityPreviewLabel;
};

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

export type SanityButtonLink = SanityResolvedLink & {
  color?: 'sand-100' | 'sand-200' | 'khaki-200' | 'forest-400' | 'lilac-200' | 'prussian-500';
};

export type SanityImage = {
  url: string;
  alt: string;
  caption?: string;
  layout?: 'default' | 'square' | 'fullbleed' | 'narrow' | 'portrait';
  rounded?: boolean;
};

export type SanityWelcomeItem = {
  _key: string;
  text?: string;
  cta?: SanityResolvedLink;
  image?: SanityImage;
  showRoomSearchForm?: boolean;
};

export type SanityTestimonialItem = {
  _type: 'testimonialItem' | 'testimonial';
  _key: string;
  _id?: string;
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
  welcomeBackgroundColor?: string;
  welcomeHeading?: string;
  welcomeItems?: SanityWelcomeItem[];
  heroLeftImage?: SanityImage;
  heroRightImage?: SanityImage;
  galleryImages: SanityImage[];
  reservationHeading?: string;
  reservationHeadingIcon?: SanityImage;
  reservationDescription?: string;
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

export type SanityRoom = {
  hostawayId: number;
  name: string;
  floor: 1 | 2 | 3;
  specialInstructions?: SanityBlock[];
};

const HOMEPAGE_ID = '6e561f5f-23ec-49fa-863f-141c005904c3';
const CONTACT_PAGE_ID = 'contact-page-singleton';
const PREVIEW_LABEL_FIELD = `"_previewLabel": select(_originalId in path("drafts.**") => "Preview", "Live Site")`;

const RESOLVE_LINK = `{ label, "href": select(linkType == "internal" => "/" + internalLink->slug.current, url), "openInNewTab": coalesce(openInNewTab, false) }`;

const RESOLVE_BUTTON_LINK = `{ label, color, "href": select(linkType == "internal" => "/" + internalLink->slug.current, url), "openInNewTab": coalesce(openInNewTab, false) }`;

const RESOLVE_FIGURE = `{ "url": image.asset->url, "alt": coalesce(alt, ""), caption, layout, "rounded": coalesce(rounded, true) }`;

const RESOLVE_IMAGE_OR_FIGURE = `select(
  defined(image.image.asset) => image${RESOLVE_FIGURE},
  defined(image.asset) => { "url": image.asset->url, "alt": coalesce(image.alt, alt, ""), caption, layout, "rounded": coalesce(rounded, true) }
)`;

const RESOLVE_COLUMN_ITEM = `{
  ...,
  "image": image${RESOLVE_FIGURE},
  "cta": cta${RESOLVE_LINK}
}`;

const RESOLVE_BODY_ITEM = `{
  ...,
  _type == "imageBlock" => { ..., "image": ${RESOLVE_IMAGE_OR_FIGURE} },
  _type == "singleImageBlock" => { ..., "image": ${RESOLVE_IMAGE_OR_FIGURE} },
  _type == "pageHeaderBlock" => { ..., "heroImage": heroImage{ "url": asset->url, "alt": coalesce(alt, "") } },
  _type == "ctaBlock" => { ..., "image": image${RESOLVE_FIGURE}, "cta": cta${RESOLVE_LINK} },
  _type == "singleColumnBlock" => { ..., "column1": column1${RESOLVE_COLUMN_ITEM} },
  _type == "twoColumnBlock" => { ..., "column1": column1${RESOLVE_COLUMN_ITEM}, "column2": column2${RESOLVE_COLUMN_ITEM} },
  _type == "threeColumnBlock" => { ..., "column1": column1${RESOLVE_COLUMN_ITEM}, "column2": column2${RESOLVE_COLUMN_ITEM}, "column3": column3${RESOLVE_COLUMN_ITEM} },
  _type == "alternatingContentBlock" => {
    ...,
    "figure": figure${RESOLVE_FIGURE},
    "ctas": ctas[]${RESOLVE_BUTTON_LINK},
    "imagePosition": coalesce(imagePosition, "right")
  },
  _type == "sectionTitleBlock" => {
    ...,
    "icon": icon{ "url": asset->url, "alt": coalesce(alt, "") }
  },
  _type == "roomSearchFormBlock" => { ..., "icon": icon${RESOLVE_FIGURE} },
  _type == "galleryStripBlock" => { ..., "images": images[]${RESOLVE_FIGURE} },
  _type == "testimonialGalleryBlock" => {
    ...,
    "items": items[]{
      _key,
      _type == "reference" => @->{ _type, _id, quote, author, role },
      _type == "figure" => { _type, _key, "url": image.asset->url, "alt": coalesce(alt, ""), caption, layout, "rounded": coalesce(rounded, false) }
    }
  }
}`;

const HOMEPAGE_FIELDS = `
  coverColor,
  welcomeBackgroundColor,
  welcomeHeading,
  "welcomeItems": welcomeItems[]{
    _key,
    text,
    "cta": cta${RESOLVE_LINK},
    "image": image{ "url": asset->url, "alt": coalesce(alt, "") },
    "showRoomSearchForm": coalesce(showRoomSearchForm, false)
  },
  "heroLeftImage": heroLeftImage{ "url": asset->url, "alt": coalesce(alt, "") },
  "heroRightImage": heroRightImage{ "url": asset->url, "alt": coalesce(alt, "") },
  "galleryImages": galleryImages[]{ "url": asset->url, "alt": coalesce(alt, "") },
  reservationHeading,
  "reservationHeadingIcon": reservationHeadingIcon{ "url": asset->url, "alt": coalesce(alt, "") },
  reservationDescription,
  testimonialsHeading,
  "testimonial": testimonial[]{
    _type,
    _key,
    _type == "testimonialItem" => { quote, author, role },
    _type == "image" => { "url": asset->url, "alt": coalesce(alt, "") }
  },
  "amenities": coalesce(amenities, []),
  "body": body[]${RESOLVE_BODY_ITEM}
`;

const PAGE_FIELDS = `
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
`;

const CONTACT_PAGE_FIELDS = `
  "meta": meta{
    ogTitle,
    ogDescription,
    "ogImage": ogImage.asset->{ "url": url }
  },
  "introduction": coalesce(introduction, []),
  "address": coalesce(address, []),
  phone,
  email,
  "directionsLink": directionsLink${RESOLVE_LINK},
  googleMapEmbedUrl
`;

type PreviewQueryResult<T> = T & {
  _previewLabel?: SanityPreviewLabel;
};

function toPreviewResult<T>(document: PreviewQueryResult<T> | null): SanityPreviewResult<T> {
  if (!document) {
    return { data: null, label: 'Live Site' };
  }

  const { _previewLabel, ...data } = document;
  return { data: data as T, label: _previewLabel ?? 'Live Site' };
}

export async function getHomepage(): Promise<SanityHomepage> {
  return getClient().fetch<SanityHomepage>(`*[_type == "homepage" && _id == $id][0]{${HOMEPAGE_FIELDS}}`, { id: HOMEPAGE_ID });
}

export async function getHomepagePreview(): Promise<SanityPreviewResult<SanityHomepage>> {
  const document = await getPreviewClient().fetch<PreviewQueryResult<SanityHomepage> | null>(
    `*[_type == "homepage" && _id == $id][0]{
      ${HOMEPAGE_FIELDS},
      ${PREVIEW_LABEL_FIELD}
    }`,
    { id: HOMEPAGE_ID },
  );

  return toPreviewResult(document);
}

export async function getPage(slug: string): Promise<SanityPage> {
  return getClient().fetch<SanityPage>(`*[_type == "page" && slug.current == $slug][0]{${PAGE_FIELDS}}`, { slug });
}

export async function getPagePreview(slug: string): Promise<SanityPreviewResult<SanityPage>> {
  const document = await getPreviewClient().fetch<PreviewQueryResult<SanityPage> | null>(
    `*[_type == "page" && slug.current == $slug][0]{
      ${PAGE_FIELDS},
      ${PREVIEW_LABEL_FIELD}
    }`,
    { slug },
  );

  return toPreviewResult(document);
}

export async function getPages(): Promise<Pick<SanityPage, 'uid'>[]> {
  return getClient().fetch<Pick<SanityPage, 'uid'>[]>(`*[_type == "page"]{ "uid": slug.current }`);
}

export async function getSanityRooms(): Promise<SanityRoom[]> {
  const rooms = await getClient().fetch<SanityRoom[]>(
    `*[_type == "room" && defined(hostawayId)]{
      hostawayId,
      name,
      floor,
      specialInstructions
    }`,
  );

  return rooms ?? [];
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

export type SanityContactPage = {
  meta?: SanityMeta;
  introduction: SanityBlock[];
  address: string[];
  phone?: string;
  email?: string;
  directionsLink: SanityLink | null;
  googleMapEmbedUrl?: string;
};

export async function getContactPage(): Promise<SanityContactPage> {
  return getClient().fetch<SanityContactPage>(`*[_type == "contactPage" && _id == $contactPageId][0]{${CONTACT_PAGE_FIELDS}}`, { contactPageId: CONTACT_PAGE_ID });
}

export async function getContactPagePreview(): Promise<SanityPreviewResult<SanityContactPage>> {
  const document = await getPreviewClient().fetch<PreviewQueryResult<SanityContactPage> | null>(
    `*[_type == "contactPage" && _id == $contactPageId][0]{
      ${CONTACT_PAGE_FIELDS},
      ${PREVIEW_LABEL_FIELD}
    }`,
    { contactPageId: CONTACT_PAGE_ID },
  );

  return toPreviewResult(document);
}

export type SanityFooterSection = {
  title: string;
  content: SanityBlock[];
};

export type SanityAwardImage = {
  url: string;
  alt: string;
  linkUrl?: string;
};

export type SanitySettings = {
  meta?: SanityMeta;
  nameplateLogo?: string;
  leftCta?: SanityButtonLink;
  rightCta?: SanityButtonLink;
  sidebarLinks: SanityLink[];
  footerSections: SanityFooterSection[];
  hideNewsletterSubscriptionForm: boolean;
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
      "hideNewsletterSubscriptionForm": coalesce(hideNewsletterSubscriptionForm, false),
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
