'use client'

import { BlockPlayground } from '../playground'
import OT_TabItemBlock from '@/cms/components/OT_TabItemBlock'
import OT_TabItemGroupAdapter from '@/cms/components/OT_TabItemGroup'
import { PlaceholderCard, ColumnMock } from './column-mock'

const PANEL_A = {
  tabLabel: 'Speed',
  heading:  'Fast for everyone, everywhere',
  body:     'Every experience loads quickly for your audience, wherever they are.',
}
const PANEL_B = {
  tabLabel: 'Testing',
  heading:  'Test ideas side by side',
  body:     'Run multiple tests at once — the platform keeps the results clean.',
}

// Fake composition nodes — enough shape for getPreviewUtils(node) and
// buildTabItemFromContent to work outside a real CMS render (no __context,
// so pa()/src() behave exactly as they do outside edit mode in production).
function fakeNode(key: string, component: Record<string, unknown>) {
  return { __typename: 'CompositionComponentNode', nodeType: 'component', key, component }
}

export default function TabItemPlayground() {
  return (
    <BlockPlayground
      defaults={{ items: '2', style: 'underline', color: 'canvas' }}
      controls={[
        {
          type: 'buttons',
          key: 'items',
          label: 'Adjacent items in column',
          options: [
            { label: '1 (isolated)', value: '1' },
            { label: '2 (grouped)',  value: '2' },
          ],
        },
        {
          type: 'buttons',
          key: 'style',
          label: 'Tab Style',
          options: [
            { label: 'Underline',    value: 'underline'   },
            { label: 'Pill',         value: 'pill'        },
            { label: 'Button Group', value: 'buttonGroup' },
          ],
        },
        {
          type: 'buttons',
          key: 'color',
          label: 'Color',
          options: [
            { label: 'Canvas',  value: 'canvas'  },
            { label: 'Surface', value: 'surface' },
            { label: 'Brand',   value: 'brand'   },
          ],
        },
      ]}
    >
      {s => {
        const displaySettings = {
          tabPosition:   'top',
          color:         s.color,
          contentLayout: 'textOnly',
          triggerAlign:  'left',
          autoPlay:      'off',
        }

        const preview = s.items === '1'
          ? (
            // Isolated path — exactly what Column.tsx falls through to for a
            // lone Tab Item: its own adapter, single-tab chrome via allowSingle.
            <OT_TabItemBlock
              content={{ ...PANEL_A, tabStyle: s.style } as any}
              displaySettings={displaySettings}
            />
          )
          : (
            // Grouped path — what Column.tsx builds when 2+ Tab Items sit
            // adjacently: a synthetic node carrying the raw sibling nodes,
            // rendered through the same OT_TabItemGroupAdapter it resolves to.
            <OT_TabItemGroupAdapter
              content={{
                __groupNodes: [
                  fakeNode('demo-a', { __typename: 'OT_TabItemBlock', ...PANEL_A, tabStyle: s.style }),
                  fakeNode('demo-b', { __typename: 'OT_TabItemBlock', ...PANEL_B }),
                ],
              }}
              displaySettings={displaySettings}
            />
          )

        return (
          <ColumnMock
            note="1 item still renders in tabbed chrome (Column.tsx's isolated fallback); 2+ adjacent items merge into one real tab switcher."
            left={preview}
            right={<PlaceholderCard />}
          />
        )
      }}
    </BlockPlayground>
  )
}
