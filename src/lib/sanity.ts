import { createClient, type SanityClient } from '@sanity/client';
import { SANITY_API_TOKEN } from 'astro:env/server';

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
  testimonial?: SanityTestimonialArrayItem[];
  amenities: string[];
  body: SanityBlock[];
};

export type SanityPage = {
  title: string;
  meta?: SanityMeta;
  body: SanityBlock[];
  uid: string;
};

const HOMEPAGE_ID = '6e561f5f-23ec-49fa-863f-141c005904c3';

const RESOLVE_LINK = `{ label, "href": select(linkType == "internal" => "/" + internalLink->slug.current, url), "openInNewTab": coalesce(openInNewTab, false) }`;

const RESOLVE_BUTTON_LINK = `{ label, color, "href": select(linkType == "internal" => "/" + internalLink->slug.current, url), "openInNewTab": coalesce(openInNewTab, false) }`;

export async function getHomepage(): Promise<SanityHomepage> {
  return getClient().fetch<SanityHomepage>(
    `*[_type == "homepage" && _id == $id][0]{
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
      "testimonial": testimonial[]{
        _type,
        _key,
        _type == "testimonialItem" => { quote, author, role },
        _type == "image" => { "url": asset->url, "alt": coalesce(alt, "") }
      },
      "amenities": coalesce(amenities, []),
      "body": body[]{
        ...,
        _type == "ctaBlock" => {
          ...,
          "cta": cta${RESOLVE_LINK}
        }
      }
    }`,
    { id: HOMEPAGE_ID },
  );
}

export async function getPage(slug: string): Promise<SanityPage> {
  return getClient().fetch<SanityPage>(
    `*[_type == "page" && slug.current == $slug][0]{
      title,
      "meta": meta{
        ogTitle,
        ogDescription,
        "ogImage": ogImage.asset->{ "url": url }
      },
      body,
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
