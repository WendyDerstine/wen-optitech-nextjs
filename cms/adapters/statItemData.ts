import type { StatItem, StatEffect } from '@/components/blocks/StatTile'

/**
 * Maps one OT_StatItemBlock content object into the StatItem shape StatTile
 * renders, plus its effect (a per-item content property, unlike OT_StatBlock
 * where effect is set once for the whole row). Shared by the standalone
 * OT_StatItemBlock adapter and the column-grouped OT_StatItemGroup adapter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildStatItemFromContent(content: any): { stat: StatItem; effect: StatEffect } {
  return {
    stat: {
      value:   String(content?.value ?? ''),
      label:   String(content?.label ?? ''),
      context: content?.context ?? undefined,
      icon:    content?.icon    ?? undefined,
    },
    effect: (content?.effect ?? 'none') as StatEffect,
  }
}
