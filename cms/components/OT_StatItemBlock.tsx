import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_StatItemBlock as OT_StatItemBlockContentType } from '@/cms/content-types/OT_StatItemBlock'
import { getStatItemStyles } from '@/cms/styling/OT_StatItemBlock.styling'
import { buildStatItemFromContent } from '@/cms/adapters/statItemData'
import StatItemBlock from '@/components/blocks/StatItemBlock'

type Props = {
  content:          ContentProps<typeof OT_StatItemBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

/**
 * Isolated render path — used whenever an OT_StatItemBlock is NOT part of an
 * adjacent run in its column (see cms/compositions/Column.tsx, which handles
 * the 2+ grouped case via OT_StatItemGroup and never reaches this adapter
 * for grouped nodes).
 */
export default function OT_StatItemBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }         = getPreviewUtils(content)
  const styleOptions   = getStatItemStyles(displaySettings)
  const { stat, effect } = buildStatItemFromContent(content)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <StatItemBlock stat={stat} styleOptions={styleOptions} effect={effect} />
    </div>
  )
}
