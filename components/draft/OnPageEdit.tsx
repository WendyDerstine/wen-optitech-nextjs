'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ContentSavedMessage = {
  properties?: Array<{ name: string; value: any }>
}

export default function OnPageEdit() {
  const router = useRouter()

  useEffect(() => {
    function handleContentSaved(msg: ContentSavedMessage) {
      const { properties = [] } = msg

      for (const prop of properties) {
        const selector = `[data-epi-property-name="${CSS.escape(prop.name)}"]`
        document
          .querySelectorAll<HTMLElement>(selector)
          .forEach(el => {
            // Block containers manage their own on-page editing — skip their descendants.
            if (el.closest('[is-on-page-editing-block-container]')) return
            if (prop.value != null) el.innerHTML = prop.value
          })
      }

      router.refresh()
    }

    // communicationinjector.js only bridges this postMessage into the
    // `optimizely:cms:contentSaved` CustomEvent (what NextPreviewComponent
    // listens for) when it considered the frame "editable" at epiReady time.
    // That bridge doesn't reliably engage in the standalone block-preview
    // iframe (app/(draft)/draft/[version]/block/[key]), so this listens to the
    // raw postMessage directly instead of depending on it.
    function handleMessage(e: MessageEvent) {
      if (e.data?.id !== 'contentSaved') return
      const previewUrl: string | undefined =
        e.data?.data?.previewUrl ?? e.data?.message?.previewUrl
      if (previewUrl) {
        try {
          const url = new URL(previewUrl)
          router.push(url.pathname + url.search)
        } catch {
          router.refresh()
        }
      } else {
        handleContentSaved(e.data?.data ?? e.data?.message ?? {})
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

  return null
}
