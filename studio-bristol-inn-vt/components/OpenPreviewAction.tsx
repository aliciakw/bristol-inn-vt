import {LaunchIcon} from '@sanity/icons/Launch'
import type {DocumentActionComponent} from 'sanity'
import {buildPreviewUrl} from '../lib/previewUrl'

const siteUrl = import.meta.env.SANITY_STUDIO_SITE_URL
const previewSecret = import.meta.env.SANITY_STUDIO_PREVIEW_SECRET

export const OpenPreviewAction: DocumentActionComponent = (props) => {
  const document = props.draft ?? props.published
  const previewUrl = document
    ? buildPreviewUrl(document, {
        refreshKey: document._rev,
        secret: previewSecret,
        siteUrl,
        studioUrl: window.location.href,
      })
    : null

  return {
    disabled: !previewUrl,
    group: ['paneActions'],
    icon: LaunchIcon,
    label: 'Open preview',
    onHandle: previewUrl
      ? () => {
          window.open(previewUrl, '_blank', 'noopener,noreferrer')
        }
      : undefined,
    title: previewUrl
      ? 'Open preview in a new tab'
      : 'A preview secret and a saved page slug are required',
  }
}

OpenPreviewAction.displayName = 'OpenPreviewAction'
