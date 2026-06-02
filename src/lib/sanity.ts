import { createClient, type SanityClient } from '@sanity/client'
import { SANITY_API_TOKEN } from 'astro:env/server'

const PROJECT_ID = '4rk27ty6'
const DATASET = 'production'
const API_VERSION = '2025-06-02'

let _client: SanityClient | null = null

export function getClient(): SanityClient {
  if (_client) return _client
  _client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: true,
    token: SANITY_API_TOKEN,
  })
  return _client
}

export type SanityBlock = { _type: string; _key: string; [key: string]: unknown }

export type SanityHomepage = {
  heroImages: { url: string; alt: string }[]
  ctaLabel: string
  ctaUrl: string
  body: SanityBlock[]
}

export type SanityPage = {
  title: string
  metaDescription: string
  body: SanityBlock[]
  uid: string
}

const HOMEPAGE_ID = "6e561f5f-23ec-49fa-863f-141c005904c3";

export async function getHomepage(): Promise<SanityHomepage> {
  return getClient().fetch<SanityHomepage>(
    `*[_type == "homepage" && _id == $id][0]{
      "heroImages": heroImages[]{ "url": asset->url, "alt": alt },
      ctaLabel,
      ctaUrl,
      body
    }`,
    { id: HOMEPAGE_ID }
  )
}

export async function getPage(slug: string): Promise<SanityPage> {
  return getClient().fetch<SanityPage>(
    `*[_type == "page" && slug.current == $slug][0]{
      title,
      metaDescription,
      body,
      "uid": slug.current
    }`,
    { slug }
  )
}

export async function getPages(): Promise<Pick<SanityPage, 'uid'>[]> {
  return getClient().fetch<Pick<SanityPage, 'uid'>[]>(
    `*[_type == "page"]{ "uid": slug.current }`
  )
}
