'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ICON_REGISTRY, type LucideIcon } from '@/components/icons/iconRegistry'

// ─── Icon lookup ──────────────────────────────────────────────────────────────
// Delegates to the shared registry (camelCase keys).
// Legacy kebab-case and title-case aliases kept for backward compat.

const ICONS: Record<string, LucideIcon> = {
  ...ICON_REGISTRY,
  'trending-up':  ICON_REGISTRY['trendingUp'],
  'bar-chart':    ICON_REGISTRY['barChart'],
  'check-circle': ICON_REGISTRY['checkCircle'],
  'Zap':          ICON_REGISTRY['zap'],
  'Shield':       ICON_REGISTRY['shield'],
  'Users':        ICON_REGISTRY['users'],
  'Trending Up':  ICON_REGISTRY['trendingUp'],
  'Clock':        ICON_REGISTRY['clock'],
  'Award':        ICON_REGISTRY['award'],
  'Bar Chart':    ICON_REGISTRY['barChart'],
  'Globe':        ICON_REGISTRY['globe'],
  'Sparkles':     ICON_REGISTRY['sparkles'],
  'Check Circle': ICON_REGISTRY['checkCircle'],
}

// ─── Public types ─────────────────────────────────────────────────────────────

export type StatItem = {
  /** Display value — prefix + number + suffix e.g. "40%", "2M+", "$4.2B", "99.99%" */
  value:    string
  /** Short metric label e.g. "Faster deployment" */
  label:    string
  /** Optional supporting context e.g. "vs. industry average" */
  context?: string
  /** Optional icon key — any string; unknown keys silently render nothing */
  icon?:    string
}

export type StatTileStyleOptions = {
  color?:         'brand' | 'canvas' | 'surface'
  /** Wraps the tile in a frosted glass panel layered over the background color */
  glass?:         boolean
  /** 'inline' (default) — icon left of the label row. 'above' — icon centered above the numeral. */
  iconPlacement?: 'inline' | 'above'
  animate?:       boolean
}

/** Visual treatment applied to the stat numeral — authored as a CMS content property. */
export type StatEffect = 'none' | 'gradient' | 'glow'

// ─── Value parser ─────────────────────────────────────────────────────────────

type Parsed = { prefix: string; number: number; suffix: string; decimals: number }

function parseValue(raw: string): Parsed {
  const m = raw.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return { prefix: '', number: 0, suffix: raw, decimals: 0 }
  const dec = m[2].includes('.') ? m[2].split('.')[1].length : 0
  return { prefix: m[1], number: parseFloat(m[2]), suffix: m[3], decimals: dec }
}

function fmtNumber(n: number, decimals: number): string {
  return n.toFixed(decimals)
}

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4
}

// ─── CVA variants ─────────────────────────────────────────────────────────────

function glassCardClass(color: 'brand' | 'canvas' | 'surface'): string {
  if (color === 'surface') return 'banner-glass-surface'
  if (color === 'canvas')  return 'banner-glass'
  return 'bg-glass'
}

const valueCva = cva('font-light leading-none tabular-nums', {
  variants: {
    color: {
      brand:   'text-fg-on-brand',
      canvas:  'text-fg',
      surface: 'text-fg',
    },
    size: {
      lg: 'text-[clamp(4rem,9vw,7.5rem)] tracking-[-0.035em]',
      md: 'text-display tracking-[-0.035em]',
      sm: 'text-[clamp(2.5rem,5.5vw,4.75rem)] tracking-[-0.035em]',
    },
  },
  defaultVariants: { color: 'brand', size: 'sm' },
})

const labelCva = cva('text-label tracking-label uppercase font-semibold', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/85',
      canvas:  'text-fg-muted',
      surface: 'text-fg-muted',
    },
  },
  defaultVariants: { color: 'brand' },
})

const contextCva = cva('text-label font-normal', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/70',
      canvas:  'text-fg-muted',
      surface: 'text-fg-muted',
    },
  },
  defaultVariants: { color: 'brand' },
})

const iconBadgeCva = cva('shrink-0', {
  variants: {
    color: {
      brand:   'text-fg-on-brand/70',
      canvas:  'text-brand/80',
      surface: 'text-brand/80',
    },
  },
  defaultVariants: { color: 'brand' },
})

// ─── Animation constants ──────────────────────────────────────────────────────

const COUNT_LAG  = 150   // ms after entry before count-up begins
const COUNT_MS   = 1400  // count-up duration

// ─── Component ────────────────────────────────────────────────────────────────

export type StatTileProps = {
  stat:          StatItem
  styleOptions?: StatTileStyleOptions
  /** Numeral visual effect — sourced from the CMS content property, not display settings. */
  effect?:       StatEffect
  /**
   * Row-level entrance state. Pass this when a grid of tiles shares one
   * IntersectionObserver so every tile enters off a single coordinated
   * trigger (see StatBlock). Omit it to let the tile observe its own
   * visibility — used when a tile renders standalone in a column.
   */
  entered?:      boolean
  /** Per-tile delay in ms, for staggering a coordinated multi-tile entrance. */
  staggerMs?:    number
  /**
   * 'card' (default) — self-contained padded tile with its own glass
   * treatment, for standalone column placement. 'row' — no self padding or
   * background; the caller (StatBlock's grid) supplies row/divider chrome.
   */
  variant?:      'card' | 'row'
  className?:    string
  /** Numeral type scale. StatBlock's grid maps this from its column count; standalone use defaults to 'sm'. */
  size?:         'lg' | 'md' | 'sm'
  /**
   * 'left' (default) — matches StatBlock's continuous row. 'center' — value,
   * rule, and label/context all centered; used for the standalone/grouped
   * column placements, which read better centered in a narrower cell than
   * left-aligned. Icon-above placement is always centered regardless.
   */
  align?:        'left' | 'center'
}

export default function StatTile({
  stat,
  styleOptions = {},
  effect = 'none',
  entered: externalEntered,
  staggerMs = 0,
  variant = 'card',
  className,
  size = 'sm',
  align = 'left',
}: StatTileProps) {
  const {
    color         = 'brand',
    glass         = false,
    iconPlacement = 'inline',
    animate       = true,
  } = styleOptions

  const iconAbove = iconPlacement === 'above'
  const centered  = iconAbove || align === 'center'
  const ref       = useRef<HTMLDivElement>(null)
  const p         = parseValue(stat.value)

  const prefersReducedMotion = usePrefersReducedMotion()

  const [shouldAnim, setShouldAnim]     = useState(false)
  const [internalEntered, setInternalEntered] = useState(false)
  const [countOn, setCountOn]           = useState(false)
  const [progress, setProgress]         = useState(1) // SSR-safe: final value
  const [pulse, setPulse]               = useState(false)

  const isControlled = externalEntered !== undefined
  const entered = isControlled ? externalEntered : internalEntered

  // ── Step 1: mount — check motion pref, optionally arm own observer ───────
  useEffect(() => {
    const willAnimate = animate && !prefersReducedMotion
    setShouldAnim(willAnimate)

    if (!willAnimate || isControlled) {
      if (!willAnimate) setInternalEntered(true)
      return
    }

    setProgress(0)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInternalEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animate, prefersReducedMotion, isControlled])

  // When controlled and animating, start count progress at 0 until entry.
  useEffect(() => {
    if (isControlled && shouldAnim) setProgress(0)
  }, [isControlled, shouldAnim])

  // ── Step 2: after entry, schedule the count-up start ─────────────────────
  useEffect(() => {
    if (!entered || !shouldAnim) return
    const t = setTimeout(() => setCountOn(true), COUNT_LAG + staggerMs)
    return () => clearTimeout(t)
  }, [entered, shouldAnim, staggerMs])

  // ── Step 3: RAF count-up loop, owned entirely by this tile ───────────────
  useEffect(() => {
    if (!countOn) return
    const start = performance.now()
    let settled = false
    let raf: number
    let pulseTimer: ReturnType<typeof setTimeout>

    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / COUNT_MS, 0), 1)
      setProgress(easeOutQuart(t))
      if (!settled && t >= 1) {
        settled = true
        setPulse(true)
        pulseTimer = setTimeout(() => setPulse(false), 280)
      }
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(pulseTimer)
    }
  }, [countOn])

  const disp = shouldAnim && !countOn ? 0 : p.number * progress

  const Icon = stat.icon ? ICONS[stat.icon] : null

  // ── Entrance transform for the tile as a whole ────────────────────────────
  const itemStyle: React.CSSProperties = shouldAnim
    ? {
        opacity:    entered ? 1 : 0,
        transform:  entered ? 'none' : 'translateY(1.25rem)',
        transition: entered
          ? [
              `opacity 600ms var(--ot-ease-kinetic) ${staggerMs}ms`,
              `transform 600ms var(--ot-ease-kinetic) ${staggerMs}ms`,
            ].join(', ')
          : 'none',
      }
    : {}

  const labelStyle: React.CSSProperties = shouldAnim
    ? {
        opacity:    entered ? 1 : 0,
        transform:  entered ? 'none' : 'translateY(0.4rem)',
        transition: [
          `opacity 0.55s var(--ot-ease-kinetic) ${staggerMs + COUNT_LAG + 60}ms`,
          `transform 0.55s var(--ot-ease-kinetic) ${staggerMs + COUNT_LAG + 60}ms`,
        ].join(', '),
      }
    : {}

  const ruleStyle: React.CSSProperties = shouldAnim
    ? {
        transform:       entered ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: centered ? 'center' : 'left',
        transition:      `transform 0.55s var(--ot-ease-kinetic) ${staggerMs + COUNT_LAG + 60}ms`,
      }
    : {}

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden flex flex-col',
        centered && 'items-center',
        variant === 'card' && (glass ? cn(glassCardClass(color), 'p-md md:p-lg') : 'p-md md:p-lg'),
        className,
      )}
      style={itemStyle}
    >
      {iconAbove && Icon && (
        <Icon
          aria-hidden="true"
          className={cn(iconBadgeCva({ color }), 'mb-sm')}
          size={38}
          strokeWidth={1.5}
          style={labelStyle}
        />
      )}

      <p
        className={cn(
          valueCva({ color, size }),
          centered && 'text-center',
          pulse && shouldAnim && 'animate-stat-pulse',
          effect === 'gradient' && 'ot-fx-gradient font-semibold',
          effect === 'glow'     && 'stat-effect-glow',
        )}
        aria-hidden="true"
      >
        {p.prefix && <span className="stat-affix mr-[0.05em]">{p.prefix}</span>}
        {fmtNumber(disp, p.decimals)}
        {p.suffix && <span className="stat-affix ml-[0.05em]">{p.suffix}</span>}
      </p>
      <span className="sr-only">{stat.value}</span>

      <span
        aria-hidden="true"
        className={cn(
          'block h-px w-8 mt-sm shrink-0',
          centered && 'mx-auto',
          color === 'brand' ? 'bg-fg-on-brand/20' : 'bg-brand/25',
        )}
        style={ruleStyle}
      />

      <div
        className={cn(
          'mt-sm flex',
          iconAbove
            ? 'flex-col items-center text-center gap-xs'
            : cn(Icon && 'items-center gap-sm', align === 'center' && 'justify-center text-center'),
        )}
        style={labelStyle}
      >
        {!iconAbove && Icon && (
          <Icon
            aria-hidden="true"
            className={iconBadgeCva({ color })}
            size={34}
            strokeWidth={1.5}
          />
        )}
        <div className={cn('flex flex-col gap-xs', centered && 'items-center')}>
          <p className={labelCva({ color })}>{stat.label}</p>
          {stat.context && (
            <p className={contextCva({ color })}>{stat.context}</p>
          )}
        </div>
      </div>
    </div>
  )
}
