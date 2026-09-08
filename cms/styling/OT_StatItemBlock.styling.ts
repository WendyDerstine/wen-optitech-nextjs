import type { StatTileStyleOptions } from '@/components/blocks/StatTile'

export function getStatItemStyles(s: Record<string, string | boolean>): StatTileStyleOptions {
  return {
    color:         (s.color         ?? 'brand')  as StatTileStyleOptions['color'],
    glass:          s.glass         === true || s.glass         === 'true',
    iconPlacement: (s.iconPlacement === 'above' ? 'above' : 'inline') as StatTileStyleOptions['iconPlacement'],
    animate:        s.animate       !== false  && s.animate  !== 'false',
  }
}
