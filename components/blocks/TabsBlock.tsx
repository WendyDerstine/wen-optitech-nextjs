import TabsBlockClient from './TabsBlock.client'
import type { TabItemData } from './TabsBlock.client'
import type { TabsStyleOptions } from '@/cms/styling/OT_TabsBlock.styling'

export type { TabItemData }

export type TabsBlockProps = {
  eyebrow?:        string
  heading?:        string
  tabs:            TabItemData[]
  styleOptions:    TabsStyleOptions
  allowSingle?:    boolean
  panelEditAttrs?: Array<Record<string, unknown> | undefined>
}

export default function TabsBlock(props: TabsBlockProps) {
  return <TabsBlockClient {...props} />
}
