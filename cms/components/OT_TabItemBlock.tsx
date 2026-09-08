import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_TabItemBlock as OT_TabItemBlockContentType } from '@/cms/content-types/OT_TabItemBlock'
import { getTabsStyles } from '@/cms/styling/OT_TabsBlock.styling'
import { buildTabItemFromContent } from '@/cms/adapters/tabItemData'
import TabsBlock from '@/components/blocks/TabsBlock'

type Props = {
  content:          ContentProps<typeof OT_TabItemBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

/**
 * Fallback/isolated render path — used whenever an OT_TabItemBlock is NOT
 * part of an adjacent run in its column (see cms/compositions/Column.tsx,
 * which handles the 2+ grouped case directly and never reaches this adapter
 * for grouped nodes). Renders a single-tab tab switcher so a lone Tab Item
 * still looks tabbed rather than like a bare panel.
 */
export default function OT_TabItemBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getTabsStyles(
    content.tabStyle ? { ...displaySettings, tabStyle: content.tabStyle } : displaySettings,
  )
  const tab = buildTabItemFromContent(content, src)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <TabsBlock tabs={[tab]} styleOptions={styleOptions} allowSingle />
    </div>
  )
}
