'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import BannerBackgroundVideo from '@/components/blocks/BannerBackgroundVideo'
import type { SlideData } from '@/components/blocks/SliderBlock'
import type { SliderStyleOptions } from '@/cms/styling/OT_SliderBlock.styling'
import {
  type SlideStyleComponentProps,
  forcedThemeFor, textRoleClass, ctaVariant, needsLightSurface,
  headingClassForHeight, contentMaxWidthClass,
  SlideBackgroundFill, SlideOverlayLayer, hasMediaFor,
} from './shared'

export type { SlideStyleComponentProps }

// ─── Background layer (Embla-translated, per slide) ────────────────────────

function SlideBackground({ slide, isActive, priority }: { slide: SlideData; isActive: boolean; priority: boolean }) {
  const hasImage = Boolean(slide.backgroundImageSrc)
  const hasVideo = Boolean(slide.backgroundVideoSrc)

  if (isActive && hasVideo) {
    return (
      <BannerBackgroundVideo
        src={slide.backgroundVideoSrc!}
        poster={slide.backgroundImageSrc}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    )
  }
  if (hasImage) {
    return (
      <Image
        src={slide.backgroundImageSrc!}
        alt=""
        fill
        sizes="100vw"
        priority={priority}
        quality={85}
        className="object-cover object-center"
      />
    )
  }
  return <SlideBackgroundFill slide={slide} />
}

// ─── Content layer (independent of the background's horizontal wipe — fades
// and lifts in place, on its own beat; see requirements §5.1 step 3–4) ─────

const CONTENT_TRANSITION_MOTION = {
  enter:  { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.35, ease: [0.65, 0, 0.35, 1] as const } },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.65, 0, 0.35, 1] as const } },
}

const CONTENT_TRANSITION_REDUCED = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
}

function SlideContent({
  slide, headingLevel, verticalAlign, height, index, count, reducedMotion,
}: {
  slide: SlideData
  headingLevel: 'h1' | 'h2'
  verticalAlign: SliderStyleOptions['contentVerticalAlign']
  height: SliderStyleOptions['height']
  index: number
  count: number
  reducedMotion: boolean
}) {
  const Heading  = headingLevel
  const hasMedia = hasMediaFor(slide)
  const forcedTheme = forcedThemeFor(slide.backgroundColor, hasMedia)
  const isFrosted = slide.overlay === 'frostedPanel' && hasMedia
  // Accent's solid fill (no media) is the one case where the CTA's ghost
  // button needs to flip to dark: Button's ghost variant defaults to a light
  // fg/border (tuned for sitting on brand/media dark grounds) and only reads
  // dark from `data-surface="light"`, a separate signal from `data-theme`
  // (see Button.tsx / globals.css [data-surface="light"]). Without it the
  // ghost button rendered light-on-light against the bright accent fill.
  const lightSurface = needsLightSurface(slide.backgroundColor, hasMedia)

  // Center falls back to left only in Editorial Split (requirements §5.2); here
  // Cinematic honors Center directly, so this is a plain 1:1 mapping.
  const placement = slide.contentPlacement ?? 'left'

  // Belt-and-suspenders legibility: over media, an always-on soft text shadow
  // so contrast doesn't depend entirely on getting Overlay + Content Placement
  // to agree (e.g. a Left Fade overlay with content placed on the right).
  // Skipped under the frosted-panel treatment, whose glass backdrop already
  // guarantees contrast on its own.
  const shadowClass = hasMedia && !isFrosted ? 'slider-text-shadow' : undefined

  const body = slide.body ? (
    <div data-rich-text="" data-color={forcedTheme === 'dark' ? 'brand' : undefined} className={cn('text-body leading-body text-pretty max-w-[60ch]', textRoleClass('body', slide.backgroundColor, hasMedia), shadowClass)}>
      {typeof slide.body === 'string' ? <p>{slide.body}</p> : <RichText content={slide.body} />}
    </div>
  ) : null

  const ctas = (slide.buttonLabel && slide.buttonUrl) || (slide.secondaryLabel && slide.secondaryUrl) ? (
    <div className="flex flex-wrap items-center gap-lg mt-sm">
      {slide.buttonLabel && slide.buttonUrl && (
        <Button variant={ctaVariant(slide.backgroundColor)} href={slide.buttonUrl}>{slide.buttonLabel}</Button>
      )}
      {slide.secondaryLabel && slide.secondaryUrl && (
        <Link
          href={slide.secondaryUrl}
          className={cn('text-label font-semibold tracking-label uppercase underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity', textRoleClass('heading', slide.backgroundColor, hasMedia), shadowClass)}
        >
          {slide.secondaryLabel}
        </Link>
      )}
    </div>
  ) : null

  const inner = (
    <>
      {slide.eyebrow && <p className={cn('text-label font-semibold tracking-label uppercase', textRoleClass('eyebrow', slide.backgroundColor, hasMedia), shadowClass)}>{slide.eyebrow}</p>}
      {slide.headline && <Heading className={cn(headingClassForHeight(height), 'font-extrabold text-balance mt-xs', textRoleClass('heading', slide.backgroundColor, hasMedia), shadowClass)}>{slide.headline}</Heading>}
      {body && <div className="mt-sm">{body}</div>}
      {ctas}
    </>
  )

  return (
    <motion.div
      key={index}
      data-theme={forcedTheme}
      data-surface={lightSurface ? 'light' : undefined}
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${count}`}
      variants={reducedMotion ? CONTENT_TRANSITION_REDUCED : CONTENT_TRANSITION_MOTION}
      initial="enter"
      animate="center"
      exit="exit"
      className={cn(
        'flex flex-col',
        contentMaxWidthClass(height),
        // Left/right placements sit near the arrow controls, so they get a
        // deliberately larger inline gutter than center's plain px — mx-auto
        // already gives center its own breathing room via the max-width cap.
        placement === 'center' && 'items-center text-center mx-auto px-md lg:px-xl',
        placement === 'right'  && 'items-end text-right ml-auto pl-md lg:pl-lg pr-lg lg:pr-2xl',
        placement === 'left'   && 'items-start text-left pr-md lg:pr-lg pl-lg lg:pl-2xl',
        isFrosted && 'banner-glass px-lg py-lg lg:px-xl lg:py-xl',
        isFrosted && (slide.backgroundColor === 'brand' ? 'banner-glass-brand'
          : slide.backgroundColor === 'brandDeep' ? 'banner-glass-brandDeep'
          : slide.backgroundColor === 'accent'    ? 'banner-glass-accent'
          : slide.backgroundColor === 'surface'   ? 'banner-glass-surface'
          : ''),
      )}
      style={{
        alignSelf: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
      }}
    >
      {inner}
    </motion.div>
  )
}

// ─── CinematicSlide ─────────────────────────────────────────────────────────

export default function CinematicSlide({ slides, styleOptions, engine }: SlideStyleComponentProps) {
  const { activeIndex, slideCount, canPrev, canNext, prev, next, goTo, progressKey, showPlayToggle, reducedMotion, viewportRef } = engine
  const activeSlide = slides[activeIndex]
  const showArrows = styleOptions.navigation === 'both' || styleOptions.navigation === 'arrows'
  const showDots   = styleOptions.navigation === 'both' || styleOptions.navigation === 'dots'
  const showAutoplayDots = showDots && styleOptions.autoPlayMs !== null

  if (!activeSlide) return null

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background layer — Embla owns the drag/swipe + snap physics here;
          the incoming slide's natural adjacent position IS the edge wipe. */}
      <div ref={viewportRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={slide.key || i} className="relative flex-[0_0_100%] h-full">
              <SlideBackground slide={slide} isActive={i === activeIndex} priority={styleOptions.headingLevel === 'h1' && i === 0} />
              <SlideOverlayLayer slide={slide} />
            </div>
          ))}
        </div>
      </div>

      {/* Content layer — independent fade/lift, lagging the background wipe */}
      <div className="relative z-10 h-full flex items-center py-xl">
        <AnimatePresence mode="sync" initial={false}>
          <SlideContent
            key={activeIndex}
            slide={activeSlide}
            headingLevel={styleOptions.headingLevel}
            verticalAlign={styleOptions.contentVerticalAlign}
            height={styleOptions.height}
            index={activeIndex}
            count={slideCount}
            reducedMotion={reducedMotion}
          />
        </AnimatePresence>
      </div>

      {/* Arrows — pinned to the far edges, vertically centered */}
      {showArrows && slideCount > 1 && (
        <>
          <button
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous slide"
            className="absolute z-20 left-md top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm hover:bg-black/35 disabled:opacity-25 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            onClick={next}
            disabled={!canNext}
            aria-label="Next slide"
            className="absolute z-20 right-md top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm hover:bg-black/35 disabled:opacity-25 transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.75} aria-hidden />
          </button>
        </>
      )}

      {/* Pagination — dot row, or progress-fill bars when Auto-Play is on */}
      {showDots && slideCount > 1 && (
        <div
          className={cn('absolute z-20 bottom-md left-1/2 -translate-x-1/2 flex items-center gap-2', showPlayToggle && 'right-md left-auto translate-x-0 bottom-md')}
          role="tablist"
          aria-label="Slides"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'relative overflow-hidden rounded-full bg-white/30 transition-all duration-300',
                i === activeIndex ? 'w-6 h-1.5 bg-white/40' : 'w-1.5 h-1.5 hover:bg-white/50',
              )}
            >
              {showAutoplayDots && i === activeIndex && (
                <span
                  key={progressKey}
                  className="slider-dot-progress bg-white"
                  style={{ '--slider-dot-dur': `${styleOptions.autoPlayMs}ms` } as React.CSSProperties}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
