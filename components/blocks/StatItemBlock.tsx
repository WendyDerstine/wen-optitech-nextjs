'use client'

import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import StatTile, { type StatItem, type StatEffect, type StatTileStyleOptions } from './StatTile'

export type { StatItem, StatEffect }

export type StatItemBlockProps = {
  stat:          StatItem
  styleOptions?: StatTileStyleOptions
  effect?:       StatEffect
}

// Standalone panel treatment — a stat sitting alone in a column needs its own
// visible boundary (unlike the section's continuous divided row).
const panelCva = cva('rounded-ot-surface border', {
  variants: {
    color: {
      brand:   'bg-brand-fill border-transparent',
      canvas:  'bg-surface border-fg/10',
      surface: 'bg-fg/6 border-fg/10',
    },
  },
  defaultVariants: { color: 'brand' },
})

function glassPanelClass(color: NonNullable<StatTileStyleOptions['color']>): string {
  if (color === 'surface') return 'banner-glass-surface'
  if (color === 'canvas')  return 'banner-glass'
  return 'bg-glass border-transparent'
}

export default function StatItemBlock({
  stat,
  styleOptions = {},
  effect = 'none',
}: StatItemBlockProps) {
  const color = styleOptions.color ?? 'brand'
  const glass = styleOptions.glass ?? false
  const isDarkSurface = color === 'brand'

  return (
    <div
      className={cn('rounded-ot-surface', glass ? glassPanelClass(color) : panelCva({ color }))}
      data-theme={isDarkSurface ? 'dark' : undefined}
    >
      <StatTile
        stat={stat}
        styleOptions={styleOptions}
        effect={effect}
        variant="row"
        className="p-lg"
        align="center"
      />
    </div>
  )
}
