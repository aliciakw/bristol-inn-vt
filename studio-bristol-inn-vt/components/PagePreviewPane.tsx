import {buildPreviewUrl} from '../lib/previewUrl'

type PreviewPaneProps = {
  document?: {
    displayed?: {
      _type?: string
      slug?: {
        current?: string
      }
    }
  }
}

const siteUrl = import.meta.env.SANITY_STUDIO_SITE_URL
const previewSecret = import.meta.env.SANITY_STUDIO_PREVIEW_SECRET

const messageStyle = {
  alignItems: 'center',
  color: '#333',
  display: 'flex',
  fontFamily: 'system-ui, sans-serif',
  height: '100%',
  justifyContent: 'center',
  padding: '24px',
  textAlign: 'center',
} as const

export function PagePreviewPane(props: PreviewPaneProps) {
  const previewUrl = buildPreviewUrl(props.document?.displayed ?? {}, {
    siteUrl,
    secret: previewSecret,
  })

  if (!previewSecret) {
    return (
      <div style={messageStyle}>
        Add SANITY_STUDIO_PREVIEW_SECRET to enable page previews.
      </div>
    )
  }

  if (!previewUrl) {
    return (
      <div style={messageStyle}>
        Add a slug, then save or publish this page to preview it.
      </div>
    )
  }

  return (
    <iframe
      key={previewUrl}
      src={previewUrl}
      title="Page preview"
      style={{border: 0, height: '100%', width: '100%'}}
    />
  )
}
