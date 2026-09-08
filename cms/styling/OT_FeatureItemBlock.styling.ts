import type { FeatureTileStyleOptions } from '@/components/blocks/FeatureTile'

export function getFeatureItemStyles(s: Record<string, string | boolean>): FeatureTileStyleOptions {
  return {
    color:     (s.color     ?? 'canvas') as FeatureTileStyleOptions['color'],
    iconStyle: (s.iconStyle ?? 'none')   as FeatureTileStyleOptions['iconStyle'],
    animate:    s.animate   !== false    && s.animate !== 'false',
  }
}
