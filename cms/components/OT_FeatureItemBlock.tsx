import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_FeatureItemBlock as OT_FeatureItemBlockContentType } from '@/cms/content-types/OT_FeatureItemBlock'
import { getFeatureItemStyles } from '@/cms/styling/OT_FeatureItemBlock.styling'
import { buildFeatureItemFromContent } from '@/cms/adapters/featureItemData'
import FeatureItemBlock from '@/components/blocks/FeatureItemBlock'

type Props = {
  content:          ContentProps<typeof OT_FeatureItemBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

/**
 * Isolated render path — used whenever an OT_FeatureItemBlock is NOT part of
 * an adjacent run in its column (see cms/compositions/Column.tsx, which
 * handles the 2+ grouped case via OT_FeatureItemGroup and never reaches this
 * adapter for grouped nodes).
 */
export default function OT_FeatureItemBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }       = getPreviewUtils(content)
  const styleOptions = getFeatureItemStyles(displaySettings)
  const feature      = buildFeatureItemFromContent(content)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <FeatureItemBlock feature={feature} styleOptions={styleOptions} />
    </div>
  )
}
