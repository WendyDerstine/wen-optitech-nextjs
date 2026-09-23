'use client'

import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, X } from 'lucide-react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import type { LocationData } from '@/lib/locations'
import LocationPlate from './LocationPlate'
import LocationLabelBadge from './LocationLabelBadge'

type Props = {
  /** null renders nothing — the parent keeps this component mounted once and
      swaps `location` in and out rather than conditionally mounting/unmounting,
      so open/close is a single prop change. */
  location: LocationData | null
  onClose:  () => void
}

// Shared full-detail surface for a location, opened from the map popup, the
// grid card, and the list row alike — one modal regardless of which view found
// it. Mirrors ImageBlock's lightbox chrome (portal, canvas/95 + blur backdrop,
// Escape + scroll-lock) since that is this codebase's one established overlay
// pattern, but adds the focus handling a content-rich dialog needs that a
// near-empty image viewer doesn't: focus moves into the dialog on open, returns
// to the trigger on close, and Tab cycles within it rather than escaping to the
// page behind.

export default function LocationDetailsModal({ location, onClose }: Props) {
  const titleId       = useId()
  const dialogRef      = useRef<HTMLDivElement | null>(null)
  const triggerElRef   = useRef<Element | null>(null)
  const open           = !!location
  const reduceMotion   = usePrefersReducedMotion()

  // Remember what had focus before opening, so closing (Escape, backdrop,
  // close button, or the browser back gesture) returns focus there instead of
  // dropping it to <body>.
  useEffect(() => {
    if (open) triggerElRef.current = document.activeElement
    else (triggerElRef.current as HTMLElement | null)?.focus?.()
  }, [open])

  useEffect(() => {
    if (!open) return

    // Move focus into the dialog once it's mounted.
    const raf = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    })

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      // Minimal focus trap: cycle Tab/Shift+Tab within the dialog's own
      // focusable elements rather than letting it escape to the page behind.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last  = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const name        = location.locationName || 'Location'
  const directions  = location.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lon}`
    : null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-canvas/95 p-4 backdrop-blur-md sm:p-6"
      style={reduceMotion ? undefined : { animation: 'fadeIn 0.15s cubic-bezier(0.16,1,0.3,1) both' }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={e => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-ot-surface bg-surface shadow-[0_24px_80px_var(--ot-bloom-brand-faint),0_0_0_1px_var(--ot-bloom-brand-border)] md:max-h-[80vh] md:flex-row"
        style={reduceMotion ? undefined : { animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close location details"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-ot-control bg-canvas/70 text-fg-muted backdrop-blur-sm transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:right-4 md:top-4"
        >
          <X size={17} strokeWidth={2} aria-hidden />
        </button>

        {/* Image — top on mobile, left column on desktop. */}
        <div className="relative aspect-4/3 flex-none bg-canvas md:aspect-auto md:w-2/5">
          <LocationPlate shape="fill" src={location.imageUrl} name={name} />
        </div>

        {/* Details — scrolls independently if the rich-text body runs long. */}
        <div className="flex min-w-0 flex-1 flex-col gap-md overflow-y-auto p-lg md:p-xl">
          <div className="flex flex-col gap-xs">
            {location.locationLabel && (
              <span><LocationLabelBadge label={location.locationLabel} tone="soft" /></span>
            )}
            <h2 id={titleId} className="text-headline leading-headline tracking-headline font-bold text-fg text-balance">
              {name}
            </h2>
            {location.address && (
              directions ? (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-sm leading-snug text-fg-muted underline decoration-fg-muted/40 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <MapPin size={15} strokeWidth={2} className="mt-0.5 flex-none text-brand" aria-hidden />
                  <span>{location.address} <span className="whitespace-nowrap">— get directions</span></span>
                </a>
              ) : (
                <p className="flex items-start gap-1.5 text-sm leading-snug text-fg-muted">
                  <MapPin size={15} strokeWidth={2} className="mt-0.5 flex-none text-brand" aria-hidden />
                  <span>{location.address}</span>
                </p>
              )
            )}
          </div>

          {location.details?.html && (
            <div
              data-rich-text=""
              data-size="compact"
              className="border-t border-fg/10 pt-md"
              dangerouslySetInnerHTML={{ __html: location.details.html }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
