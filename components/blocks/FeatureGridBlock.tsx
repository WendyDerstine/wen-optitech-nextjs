'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'
import FeatureTile, { type FeatureItem } from './FeatureTile'

export type { FeatureItem }

export type FeatureGridStyleOptions = {
  color?:     'canvas' | 'surface' | 'brand'
  layout?:    'grid' | 'ruled'
  columns?:   2 | 3 | 4
  /**
   * none:       Icons hidden regardless of slot configuration.
   * accent:     Small icon (18px) inline before the headline.
   * structural: Medium icon (32px) above the headline, slightly muted.
   */
  iconStyle?: 'none' | 'accent' | 'structural'
  animate?:   boolean
}

// ─── CVA variants ─────────────────────────────────────────────────────────────

const sectionCva = cva('w-full px-md lg:px-lg py-xl lg:py-2xl', {
  variants: {
    color: {
      canvas:  'bg-canvas',
      surface: 'bg-surface',
      brand:   'bg-brand-fill',
    },
  },
  defaultVariants: { color: 'canvas' },
})

const eyebrowCva = cva('text-label tracking-label uppercase font-semibold mb-sm', {
  variants: {
    color: {
      canvas:  'text-brand',
      surface: 'text-brand',
      brand:   'text-fg-on-brand/70',
    },
  },
  defaultVariants: { color: 'canvas' },
})

const headingCva = cva(
  'font-bold text-headline leading-headline tracking-headline',
  {
    variants: {
      color: {
        canvas:  'text-fg',
        surface: 'text-fg',
        brand:   'text-fg-on-brand',
      },
    },
    defaultVariants: { color: 'canvas' },
  },
)

const subheadingCva = cva('mt-sm text-body leading-body max-w-(--ot-measure)', {
  variants: {
    color: {
      canvas:  'text-fg-muted',
      surface: 'text-fg-muted',
      brand:   'text-fg-on-brand/70',
    },
  },
  defaultVariants: { color: 'canvas' },
})

const sectionCtaCva = cva(
  'inline-flex items-center gap-xs min-h-[44px] text-label tracking-label font-semibold uppercase transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
  {
    variants: {
      color: {
        canvas:  'text-brand',
        surface: 'text-brand',
        brand:   'text-fg-on-brand',
      },
    },
    defaultVariants: { color: 'canvas' },
  },
)

// ─── Animation constants ──────────────────────────────────────────────────────

const STAGGER_MS = 80

// ─── Component ────────────────────────────────────────────────────────────────

export type FeatureGridBlockProps = {
  features:     FeatureItem[]
  eyebrow?:     string
  heading?:     string
  subheading?:  string
  ctaLabel?:    string
  ctaUrl?:      string
  styleOptions?: FeatureGridStyleOptions
}

export default function FeatureGridBlock({
  features,
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaUrl,
  styleOptions = {},
}: FeatureGridBlockProps) {
  const {
    color     = 'canvas',
    layout    = 'grid',
    columns   = 3,
    iconStyle = 'none',
    animate   = true,
  } = styleOptions

  // Shared entrance trigger — every tile enters off one observer on the
  // section, staggered by index, rather than each tile observing itself.
  const ref = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)
  const prefersReducedMotion  = usePrefersReducedMotion()

  useEffect(() => {
    if (!animate || prefersReducedMotion) {
      setEntered(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animate, prefersReducedMotion])

  // ── Grid column class ─────────────────────────────────────────────────────
  const gridColsClass =
    layout === 'ruled'
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : columns === 4
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  // ── Divider color for ruled items ─────────────────────────────────────────
  const ruledBorderClass = color === 'brand' ? 'border-fg-on-brand/20' : 'border-fg/10'

  const hasHeader     = eyebrow || heading || subheading
  const hasSectionCta = ctaLabel && ctaUrl

  return (
    <section
      ref={ref}
      className={sectionCva({ color })}
      aria-label={heading ?? 'Features'}
    >
      {/* ── Section header ──────────────────────────────────────────────── */}
      {hasHeader && (
        <div className="mb-xl">
          {eyebrow && (
            <p className={eyebrowCva({ color })}>{eyebrow}</p>
          )}
          {heading && (
            <h2 className={headingCva({ color })}>{heading}</h2>
          )}
          {subheading && (
            <p className={subheadingCva({ color })}>{subheading}</p>
          )}
        </div>
      )}

      {/* ── Feature grid ────────────────────────────────────────────────── */}
      <ul
        className={cn(
          'grid',
          gridColsClass,
          layout === 'grid' ? 'gap-x-xl gap-y-lg' : 'gap-0',
        )}
        role="list"
      >
        {features.map((feature, i) => (
          <li
            key={i}
            className={cn(
              layout === 'ruled' && ['border-t pt-md pb-lg', ruledBorderClass],
            )}
          >
            <FeatureTile
              feature={feature}
              styleOptions={{ color, iconStyle, animate }}
              entered={entered}
              staggerMs={i * STAGGER_MS}
              variant={layout === 'grid' ? 'card' : 'bare'}
            />
          </li>
        ))}
      </ul>

      {/* ── Section CTA ─────────────────────────────────────────────────── */}
      {hasSectionCta && (
        <div className="mt-xl">
          <a href={ctaUrl} className={sectionCtaCva({ color })}>
            {ctaLabel}
            <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  )
}
