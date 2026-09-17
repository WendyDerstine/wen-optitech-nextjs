'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import type { SlideData } from '@/components/blocks/SliderBlock'
import {
  type SlideStyleComponentProps,
  forcedThemeFor, textRoleClass, ctaVariant, needsLightSurface, hasMediaFor, glassClassFor,
  headingClassForHeight, SlideVisual, SlideOverlayLayer, resolveRadiusPx,
} from './shared'

export type { SlideStyleComponentProps }

// ─── Emerge — requirements §5.4 ─────────────────────────────────────────────
//
// Full-bleed background like Cinematic, but content splits into two fixed
// zones (body pinned top-left, headline pinned bottom-left) instead of one
// movable block — Content Placement / Content Vertical Alignment are ignored
// by design. The signature move is the reveal panel: a preview of the
// *incoming* slide peeks in from the right edge; advancing grows it to
// "swallow" the frame, then the content zones swap on their own delayed beat.
//
// The peek panel is a real, full-resolution copy of the slide's own
// background (same <Image>/<video>, same `sizes` hint) with a `clip-path:
// inset(...)` masking most of it away — growing the reveal is just animating
// that inset toward 0, never a CSS `scale()` transform. A tiny fixed-size
// thumbnail scaled up via `transform` would need to stretch a low-resolution
// source across the whole viewport (visibly blurry); clipping a full-size
// image never touches its resolution, so it stays sharp start to finish, and
// the swap to the real background at the end is genuinely seamless.
//
// Two independently-timed beats (only for forward advances — see NOTE below):
//   Beat 1 (~850ms, accelerating ease): the peek panel's clip-path opens from
//     its resting window to full coverage; its rounded corners flatten to 0
//     in step. The instant it fully covers, the real background swaps
//     underneath — invisible, since the panel already shows the same image.
//   Beat 2 (starts ~180ms after beat 1 resolves): old body/headline zones
//     fade out (~200ms), new zones fade + rise in (~300ms), and a *new* peek
//     panel — previewing the slide after that — fades in.
//
// NOTE (disclosed implementation call, mirrors the Story Rail "back
// affordance" open item in the requirements doc): the reveal theater is
// specified only for forward advances, driven by the peek panel. A backward
// move (keyboard Left, swipe-back, or a bounce reversal) has no described
// choreography, so it falls back to a plain crossfade of background +
// content — still legible and immediate, just not the signature "swallow."

const GROW_MS  = 850
const PAUSE_MS = 180
const OUT_MS   = 200

// Rest window: a panel peeking in from the right edge, vertically centered —
// ~20% of the viewport wide, ~38% tall. Percentages (not measured pixels) so
// the clip stays correct across resizes with no ResizeObserver bookkeeping.
const REST_INSET = { top: 31, right: 0, bottom: 31, left: 80 }

function clipPath(radiusPx: number) {
  return `inset(${REST_INSET.top}% ${REST_INSET.right}% ${REST_INSET.bottom}% ${REST_INSET.left}% round ${radiusPx}px)`
}
const CLIP_FULL = 'inset(0% 0% 0% 0% round 0px)'

function wrap(n: number, count: number) {
  return ((n % count) + count) % count
}

// ─── Peek / reveal panel ────────────────────────────────────────────────────

type PanelMode = 'rest' | 'growing'

function RevealPanel({
  slide, mode, interactive, disabled, reducedMotion, restRadiusPx, onActivate, onGrowComplete,
}: {
  slide: SlideData
  mode: PanelMode
  interactive: boolean
  disabled: boolean
  reducedMotion: boolean
  restRadiusPx: number
  onActivate: () => void
  onGrowComplete: () => void
}) {
  const restClip = clipPath(restRadiusPx)

  return (
    <motion.div
      initial={{ opacity: mode === 'growing' ? 1 : 0, clipPath: restClip }}
      animate={
        mode === 'growing'
          ? { opacity: 1, clipPath: CLIP_FULL, transition: { duration: reducedMotion ? 0.15 : GROW_MS / 1000, ease: [0.6, 0, 0.3, 1] as const } }
          : { opacity: 1, clipPath: restClip, transition: { duration: 0.3 } }
      }
      onAnimationComplete={() => { if (mode === 'growing') onGrowComplete() }}
      className="absolute inset-0 z-20"
      style={{ willChange: 'clip-path' }}
    >
      <SlideVisual slide={slide} />
      {/* Decorative frame + click target — a normally-boxed sibling (not
          clip-path'd) so its ring/shadow/radius render as a clean card
          outline around the visible window instead of being clipped away
          along with everything outside it. Rest-only: mid-grow there's
          nothing left to click, and the frame would just be in the way. */}
      {mode === 'rest' && (
        <>
          <div
            aria-hidden="true"
            className="absolute ring-1 ring-white/25 shadow-hover-lift pointer-events-none"
            style={{ top: `${REST_INSET.top}%`, bottom: `${REST_INSET.bottom}%`, left: `${REST_INSET.left}%`, right: `${REST_INSET.right}%`, borderRadius: restRadiusPx }}
          />
          <button
            type="button"
            onClick={onActivate}
            disabled={disabled}
            aria-hidden={!interactive}
            tabIndex={interactive ? 0 : -1}
            aria-label="Next slide"
            className={cn('absolute', interactive && !disabled ? 'cursor-pointer' : 'pointer-events-none', disabled && 'opacity-40')}
            style={{ top: `${REST_INSET.top}%`, bottom: `${REST_INSET.bottom}%`, left: `${REST_INSET.left}%`, right: `${REST_INSET.right}%`, borderRadius: restRadiusPx }}
          />
        </>
      )}
    </motion.div>
  )
}

// ─── EmergeSlide ────────────────────────────────────────────────────────────

const ZONE_VARIANTS = {
  enter:  { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] as const } },
  exit:   { opacity: 0, y: -8, transition: { duration: OUT_MS / 1000, ease: [0.65, 0, 0.35, 1] as const } },
}
const ZONE_VARIANTS_REDUCED = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
}

export default function EmergeSlide({ slides, styleOptions, engine }: SlideStyleComponentProps) {
  const { activeIndex, slideCount, canPrev, canNext, prev, next, reducedMotion, viewportRef } = engine
  const prevActiveRef = useRef(activeIndex)
  const timersRef = useRef<number[]>([])

  const [bgIndex, setBgIndex]           = useState(activeIndex)
  const [contentIndex, setContentIndex] = useState(activeIndex)
  // Decoupled from `contentIndex` so the zones can hide the instant a forward
  // advance starts, well before `contentIndex` itself changes — see NOTE in
  // the header comment: content stays hidden for the whole reveal sweep, not
  // just the tail end of it.
  const [contentShown, setContentShown] = useState(true)
  const [growThumb, setGrowThumb]       = useState<number | null>(null)
  const [restThumbIndex, setRestThumbIndex] = useState(wrap(activeIndex + 1, slideCount))
  const [restThumbKey, setRestThumbKey] = useState(0)

  // Resolve the theme's surface-radius token to a real px number once, so the
  // clip-path's `round` can interpolate it toward 0 (a raw `var(--radius-...)`
  // string can't be tweened by Framer Motion — it needs a resolved number).
  // Floored at 20px so the peek panel still reads as a deliberate rounded
  // card even in a theme (like the current default) whose surface radius is 0
  // — an editorial flourish, not a themed control, so this floor is by design.
  const [restRadiusPx] = useState(() => resolveRadiusPx('--ot-radius-surface', 20))

  function clearTimers() {
    timersRef.current.forEach(id => clearTimeout(id))
    timersRef.current = []
  }
  function schedule(fn: () => void, ms: number) {
    timersRef.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => clearTimers(), [])

  function handleGrowComplete(finishedIndex: number) {
    setBgIndex(finishedIndex)
    setGrowThumb(null)
    schedule(() => {
      setContentIndex(finishedIndex)
      setContentShown(true)
    }, PAUSE_MS)
    schedule(() => {
      setRestThumbIndex(wrap(finishedIndex + 1, slideCount))
      setRestThumbKey(k => k + 1)
    }, PAUSE_MS + OUT_MS)
  }

  useEffect(() => {
    const prevIndex = prevActiveRef.current
    prevActiveRef.current = activeIndex
    if (prevIndex === activeIndex) return
    const isForward = activeIndex === wrap(prevIndex + 1, slideCount)

    clearTimers()

    if (reducedMotion || !isForward) {
      // Reduced motion, or a backward move — see NOTE above. Instant/plain
      // crossfade: both layers just jump to the new index together.
      setGrowThumb(null)
      setBgIndex(activeIndex)
      setContentIndex(activeIndex)
      setContentShown(true)
      setRestThumbIndex(wrap(activeIndex + 1, slideCount))
      setRestThumbKey(k => k + 1)
      return
    }

    // Forward: hide the content zones immediately — they stay hidden for the
    // whole ~850ms reveal sweep, not just its tail end — then kick off Beat 1.
    // The resting panel already previews `activeIndex` (it always shows
    // "next"), so it grows in place.
    setContentShown(false)
    setGrowThumb(activeIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])

  const bgSlide      = slides[bgIndex]
  const contentSlide = slides[contentIndex]
  if (!bgSlide || !contentSlide) return null

  const contentHasMedia = hasMediaFor(contentSlide)
  const forcedTheme = forcedThemeFor(contentSlide.backgroundColor, contentHasMedia)
  const lightSurface = needsLightSurface(contentSlide.backgroundColor, contentHasMedia)
  const shadowClass  = contentHasMedia ? 'slider-text-shadow' : undefined
  // The "Frosted Panel" Overlay choice gives the headline zone its own glass
  // card — same treatment Cinematic uses, just applied per-zone here since
  // Emerge has two independently-pinned zones instead of one content block.
  // Not gated on media: a solid-color slide (e.g. a light canvas/surface
  // fill) should still get the glass treatment when this overlay is picked.
  const isFrosted = contentSlide.overlay === 'frostedPanel'
  // The body zone's small label-sized text is the one thing users kept
  // flagging as hard to read over arbitrary imagery — it always gets a
  // background, on media or a solid fill alike, regardless of Overlay.
  const bodyPaneled = true
  const glassProps = { 'data-media': contentSlide.backgroundVideoSrc ? ('video' as const) : undefined }
  const glassClass = cn('banner-glass', glassClassFor(contentSlide.backgroundColor))
  // Match the peek panel's rounding rather than the theme's (possibly 0)
  // surface-radius token, so every rounded-corner element in this style reads
  // as one consistent shape language.
  const glassRadius = { borderRadius: restRadiusPx }
  // Thin brand-colored edge on the body panel's two "open" sides (right/
  // bottom) — the top/left sides are flush against the viewport corner, so a
  // border there would just look like a stray line at the frame's edge.
  const bodyEdgeStyle = {
    borderRadius: `0 0 ${restRadiusPx}px 0`,
    border: 'none',
    borderRight:  '1px solid oklch(from var(--ot-brand) l c h / 0.5)',
    borderBottom: '1px solid oklch(from var(--ot-brand) l c h / 0.5)',
  }

  const showDots   = styleOptions.navigation === 'both' || styleOptions.navigation === 'dots'
  const arrowsOn   = styleOptions.navigation === 'both' || styleOptions.navigation === 'arrows'
  // Requirements §5.4: Navigation `none` keeps the panel visible (core to
  // the look) but non-interactive — swipe/keyboard remain the only advance
  // methods in that case.
  const panelInteractive = arrowsOn && slideCount > 1

  const variants = reducedMotion ? ZONE_VARIANTS_REDUCED : ZONE_VARIANTS
  const zoneTheme = { 'data-theme': forcedTheme, 'data-surface': lightSurface ? ('light' as const) : undefined }

  // An editorial pull-quote treatment — larger, thin-weight — rather than
  // plain small label text, now that the corner-anchored panel has room for
  // it to be a deliberate typographic moment instead of a caption.
  const body = contentSlide.body ? (
    <div data-rich-text="" data-color={forcedTheme === 'dark' ? 'brand' : undefined} className={cn('text-title font-light leading-title tracking-title text-pretty', textRoleClass('body', contentSlide.backgroundColor, contentHasMedia), !bodyPaneled && shadowClass)}>
      {typeof contentSlide.body === 'string' ? <p>{contentSlide.body}</p> : <RichText content={contentSlide.body} />}
    </div>
  ) : null

  const ctas = (contentSlide.buttonLabel && contentSlide.buttonUrl) || (contentSlide.secondaryLabel && contentSlide.secondaryUrl) ? (
    <div className="flex flex-wrap items-center gap-lg mt-sm">
      {contentSlide.buttonLabel && contentSlide.buttonUrl && (
        <Button variant={ctaVariant(contentSlide.backgroundColor)} href={contentSlide.buttonUrl}>{contentSlide.buttonLabel}</Button>
      )}
      {contentSlide.secondaryLabel && contentSlide.secondaryUrl && (
        <Link
          href={contentSlide.secondaryUrl}
          className={cn('text-label font-semibold tracking-label uppercase underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity', textRoleClass('heading', contentSlide.backgroundColor, contentHasMedia), !isFrosted && shadowClass)}
        >
          {contentSlide.secondaryLabel}
        </Link>
      )}
    </div>
  ) : null

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Invisible drag surface — Embla still owns index/swipe/loop/autoplay
          state here exactly as in every other style; Emerge just doesn't use
          its translated track as the visible background. */}
      <div ref={viewportRef} className="absolute inset-0 overflow-hidden opacity-0" aria-hidden="true">
        <div className="flex h-full">
          {slides.map((slide, i) => <div key={slide.key || i} className="relative flex-[0_0_100%] h-full" />)}
        </div>
      </div>

      {/* Background — swapped only once Beat 1's reveal panel fully covers
          the frame, so the swap itself is never visible. */}
      <div className="absolute inset-0" aria-hidden="true">
        <SlideVisual slide={bgSlide} priority={styleOptions.headingLevel === 'h1' && bgIndex === 0} />
        <SlideOverlayLayer slide={bgSlide} />
      </div>

      {/* Body zone — flush against the top-left corner rather than inset from
          it, so the panel reads as a block growing out of the edge (rounded,
          brand-edged only on its two open sides, to match). Always paneled —
          this text has no other reliable way to stay legible across every
          Background Color / Overlay combination, media or not. */}
      <div className="absolute z-10 top-0 left-0 max-w-136 pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          {contentShown && body && (
            <motion.div key={contentIndex} {...zoneTheme} variants={variants} initial="enter" animate="center" exit="exit" className="pointer-events-auto">
              <div {...glassProps} style={bodyEdgeStyle} className={cn(glassClass, 'pt-sm pl-sm pr-md pb-sm lg:pt-md lg:pl-md lg:pr-lg lg:pb-md')}>
                {body}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Headline zone — pinned bottom-left, with the numbered progress index
          just above it. Bottom offset is padded a bit extra so the CTA row
          never collides with the mandatory autoplay pause control, which
          also lives in this corner (SliderBlock.client.tsx). */}
      <div className="absolute z-10 left-lg lg:left-xl bottom-18 lg:bottom-20 max-w-152 flex flex-col gap-sm">
        {showDots && slideCount > 1 && (
          <motion.div
            {...zoneTheme}
            animate={{ opacity: contentShown ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-sm"
            aria-hidden="true"
          >
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'text-label font-semibold tracking-label tabular-nums transition-opacity duration-200',
                  i === contentIndex ? cn('opacity-100', textRoleClass('heading', contentSlide.backgroundColor, contentHasMedia)) : cn('opacity-40', textRoleClass('body', contentSlide.backgroundColor, contentHasMedia)),
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {contentShown && (
            <motion.div key={contentIndex} {...zoneTheme} variants={variants} initial="enter" animate="center" exit="exit" className="flex flex-col">
              <div {...(isFrosted ? glassProps : {})} style={isFrosted ? glassRadius : undefined} className={cn('flex flex-col', isFrosted && [glassClass, 'px-sm py-xs lg:px-md lg:py-sm'])}>
                {contentSlide.eyebrow && (
                  <p className={cn('text-label font-semibold tracking-label uppercase', textRoleClass('eyebrow', contentSlide.backgroundColor, contentHasMedia), !isFrosted && shadowClass)}>{contentSlide.eyebrow}</p>
                )}
                {contentSlide.headline && (
                  <h2 className={cn(headingClassForHeight(styleOptions.height), 'font-extrabold text-balance mt-xs max-w-[24ch]', textRoleClass('heading', contentSlide.backgroundColor, contentHasMedia), !isFrosted && shadowClass)}>
                    {contentSlide.headline}
                  </h2>
                )}
                {ctas}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation arrows — bottom-center, clear of the bottom-left headline
          zone / pause control and the right-side reveal panel. */}
      {arrowsOn && slideCount > 1 && (
        <div className="absolute z-20 bottom-md left-1/2 -translate-x-1/2 flex items-center gap-sm">
          <button
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous slide"
            className="flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm hover:bg-black/35 disabled:opacity-25 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            onClick={next}
            disabled={!canNext}
            aria-label="Next slide"
            className="flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm hover:bg-black/35 disabled:opacity-25 transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      )}

      {/* Reveal panel — the resting preview of "next", or actively growing to
          swallow the frame on a forward advance. */}
      {slideCount > 1 && (
        <RevealPanel
          key={growThumb !== null ? `grow-${growThumb}` : `rest-${restThumbKey}`}
          slide={slides[growThumb ?? restThumbIndex]}
          mode={growThumb !== null ? 'growing' : 'rest'}
          interactive={panelInteractive}
          disabled={!canNext}
          reducedMotion={reducedMotion}
          restRadiusPx={restRadiusPx}
          onActivate={next}
          onGrowComplete={() => handleGrowComplete(growThumb!)}
        />
      )}
    </div>
  )
}
