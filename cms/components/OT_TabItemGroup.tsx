import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { getTabsStyles } from '@/cms/styling/OT_TabsBlock.styling'
import { buildTabItemFromContent } from '@/cms/adapters/tabItemData'
import TabsBlock from '@/components/blocks/TabsBlock'
import type { CompositionNode } from '@/cms/compositions/groupAdjacentComponents'

/**
 * Renders a synthetic "__OT_TabItemGroup" node built by
 * cms/compositions/Column.tsx when 2+ OT_TabItemBlock elements sit
 * adjacently in a column. Never a real CMS content type — registered only
 * in the React component resolver, keyed to a __typename that only
 * Column.tsx's synthetic nodes ever carry, so real CMS content can never
 * accidentally resolve here.
 *
 * Per the confirmed design, the leading node's display settings (already
 * parsed by the SDK's OptimizelyGridSection before this component is
 * reached) control the whole group's chrome; every node's own content
 * fields still populate its own panel.
 */
type Props = {
  content: {
    __groupNodes: CompositionNode[]
    __composition?: CompositionNode
  }
  displaySettings?: Record<string, string | boolean>
}

export default function OT_TabItemGroupAdapter({ content, displaySettings = {} }: Props) {
  const groupNodes     = content.__groupNodes ?? []
  const firstComponent = groupNodes[0]?.component ?? {}
  const styleOptions   = getTabsStyles(
    firstComponent.tabStyle ? { ...displaySettings, tabStyle: firstComponent.tabStyle } : displaySettings,
  )

  const tabs = groupNodes.map(node => {
    const { src } = getPreviewUtils(node as any)
    return buildTabItemFromContent(node.component, src)
  })

  const panelEditAttrs = groupNodes.map(node => getPreviewUtils(node as any).pa(node as any))

  return (
    <div className="w-full">
      <TabsBlock
        tabs={tabs}
        styleOptions={styleOptions}
        allowSingle
        panelEditAttrs={panelEditAttrs}
      />
    </div>
  )
}
