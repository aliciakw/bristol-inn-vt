import {useEffect, useRef, useState} from 'react'
import {buildPreviewUrl} from '../lib/previewUrl'

type PreviewPaneProps = {
  document?: {
    displayed?: {
      _rev?: string
      _updatedAt?: string
      _type?: string
      slug?: {
        current?: string
      }
    }
  }
}

const siteUrl = import.meta.env.SANITY_STUDIO_SITE_URL
const previewSecret = import.meta.env.SANITY_STUDIO_PREVIEW_SECRET
const DESKTOP_PREVIEW_WIDTH = 1440
const MOBILE_PREVIEW_WIDTH = 390

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

const previewShellStyle = {
  background: '#f5f5f5',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
} as const

type PaneSize = {
  height: number
  width: number
}

type ScaledPreviewPaneProps = PreviewPaneProps & {
  previewWidth: number
  title: string
}

function ScaledPreviewPane(props: ScaledPreviewPaneProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [paneSize, setPaneSize] = useState<PaneSize>({height: 0, width: 0})
  const displayedDocument = props.document?.displayed ?? {}
  const refreshKey = displayedDocument._rev ?? displayedDocument._updatedAt
  const previewUrl = buildPreviewUrl(props.document?.displayed ?? {}, {
    refreshKey,
    siteUrl,
    secret: previewSecret,
    studioUrl: window.location.href,
  })

  useEffect(() => {
    if (!shellRef.current) {
      return undefined
    }

    const updatePaneSize = () => {
      const rect = shellRef.current?.getBoundingClientRect()

      if (!rect) {
        return
      }

      setPaneSize({height: rect.height, width: rect.width})
    }

    updatePaneSize()

    const resizeObserver = new ResizeObserver(updatePaneSize)
    resizeObserver.observe(shellRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  if (!previewSecret) {
    return <div style={messageStyle}>Add SANITY_STUDIO_PREVIEW_SECRET to enable page previews.</div>
  }

  if (!previewUrl) {
    return <div style={messageStyle}>Add a slug, then save or publish this page to preview it.</div>
  }

  const scale = paneSize.width > 0 ? Math.min(paneSize.width / props.previewWidth, 1) : 1
  const iframeHeight = paneSize.height > 0 ? Math.ceil(paneSize.height / scale) : '100%'

  return (
    <div ref={shellRef} style={previewShellStyle}>
      <iframe
        key={previewUrl}
        src={previewUrl}
        title={props.title}
        style={{
          border: 0,
          height: iframeHeight,
          left: '50%',
          position: 'absolute',
          top: 0,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'top center',
          width: props.previewWidth,
        }}
      />
    </div>
  )
}

export function PagePreviewPane(props: PreviewPaneProps) {
  return <ScaledPreviewPane {...props} previewWidth={DESKTOP_PREVIEW_WIDTH} title="Page preview" />
}

export function MobilePagePreviewPane(props: PreviewPaneProps) {
  return (
    <ScaledPreviewPane {...props} previewWidth={MOBILE_PREVIEW_WIDTH} title="Mobile page preview" />
  )
}
