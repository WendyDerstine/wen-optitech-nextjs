'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    epi?: {
      subscribe:   (event: string, cb: (msg: any) => void) => void
      unsubscribe: (event: string, cb: (msg: any) => void) => void
    }
  }
}

type ContentSavedMessage = {
  properties?: Array<{ name: string; value: any }>
}

export default function OnPageEdit() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    function handleContentSaved(msg: ContentSavedMessage) {
      console.log('[OnPageEdit] contentSaved fired', msg)
      const { properties = [] } = (msg as any)?.detail ?? msg

      for (const prop of properties) {
        const selector = `[data-epi-property-name="${CSS.escape(prop.name)}"]`
        document
          .querySelectorAll<HTMLElement>(selector)
          .forEach(el => {
            if (el.closest('[is-on-page-editing-block-container]')) return
            if (prop.value != null) el.innerHTML = prop.value
          })
      }

      router.refresh()
    }

    // New DOM CustomEvent API (dispatched by some versions of communicationinjector.js)
    function handleNewEvent(e: Event) {
      handleContentSaved((e as CustomEvent).detail ?? {})
    }

    window.addEventListener('optimizely:cms:contentSaved', handleNewEvent)
    console.log('[OnPageEdit] listening for optimizely:cms:contentSaved')

    // Catch raw postMessages from the CMS frame to see what protocol it uses
    function handleMessage(e: MessageEvent) {
      if (e.data && typeof e.data === 'object') {
        console.log('[OnPageEdit] postMessage received:', JSON.stringify(e.data))
      }
    }
    window.addEventListener('message', handleMessage)

    // Old epi API — poll until communicationinjector.js defines window.epi
    function trySubscribe() {
      if (cancelled) return
      if (window.epi?.subscribe) {
        console.log('[OnPageEdit] window.epi found, subscribing to contentSaved')
        window.epi.subscribe('contentSaved', handleContentSaved)
      } else {
        timer = setTimeout(trySubscribe, 100)
      }
    }

    trySubscribe()

    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener('optimizely:cms:contentSaved', handleNewEvent)
      window.removeEventListener('message', handleMessage)
      window.epi?.unsubscribe?.('contentSaved', handleContentSaved)
    }
  }, [])

  return null
}
