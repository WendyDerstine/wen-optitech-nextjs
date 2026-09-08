'use client'

import { BlockPlayground } from '../playground'
import OT_StatItemBlock from '@/cms/components/OT_StatItemBlock'
import OT_StatItemGroupAdapter from '@/cms/components/OT_StatItemGroup'
import { PlaceholderCard, ColumnMock } from './column-mock'

const STATS = [
  { value: '40%',    label: 'Faster deployment', context: 'vs. baseline',       icon: 'zap'        },
  { value: '99.99%', label: 'Uptime SLA',        context: 'across all regions', icon: 'shield'     },
  { value: '2M+',    label: 'Active users',      context: 'and growing',       icon: 'users'      },
  { value: '5x',     label: 'More content reuse', context: 'across channels',  icon: 'trendingUp' },
]

// Fake composition nodes — enough shape for getPreviewUtils(node) and
// buildStatItemFromContent to work outside a real CMS render.
function fakeNode(key: string, component: Record<string, unknown>) {
  return { __typename: 'CompositionComponentNode', nodeType: 'component', key, component }
}

export default function StatItemPlayground() {
  return (
    <BlockPlayground
      defaults={{ items: '4', color: 'canvas', glass: 'no', effect: 'none', iconPlacement: 'inline' }}
      controls={[
        {
          type: 'buttons',
          key: 'items',
          label: 'Adjacent items in column',
          options: [
            { label: '1',          value: '1' },
            { label: '2 (2-col)',  value: '2' },
            { label: '4 (2x2)',    value: '4' },
          ],
        },
        {
          type: 'buttons',
          key: 'color',
          label: 'Color',
          options: [
            { label: 'Brand',   value: 'brand'   },
            { label: 'Canvas',  value: 'canvas'  },
            { label: 'Surface', value: 'surface' },
          ],
        },
        {
          type: 'buttons',
          key: 'glass',
          label: 'Glass',
          options: [
            { label: 'Off', value: 'no'  },
            { label: 'On',  value: 'yes' },
          ],
        },
        {
          type: 'buttons',
          key: 'effect',
          label: 'Effect',
          options: [
            { label: 'None',     value: 'none'     },
            { label: 'Gradient', value: 'gradient' },
            { label: 'Glow',     value: 'glow'     },
          ],
        },
        {
          type: 'buttons',
          key: 'iconPlacement',
          label: 'Icon placement',
          options: [
            { label: 'Inline', value: 'inline' },
            { label: 'Above',  value: 'above'  },
          ],
        },
      ]}
    >
      {s => {
        const displaySettings = {
          color: s.color,
          glass: s.glass === 'yes',
          iconPlacement: s.iconPlacement,
          animate: false,
        }
        const count = parseInt(s.items, 10)

        const preview = count === 1
          ? (
            // Isolated path — Column.tsx's default for a lone Stat Item: its
            // own adapter, rendered as a standalone bordered card.
            <OT_StatItemBlock
              content={{ ...STATS[0], effect: s.effect } as any}
              displaySettings={displaySettings}
            />
          )
          : (
            // Grouped path — what Column.tsx builds when 2+ Stat Items sit
            // adjacently: a synthetic node carrying the raw sibling nodes,
            // rendered through the same OT_StatItemGroupAdapter it resolves to.
            <OT_StatItemGroupAdapter
              content={{
                __groupNodes: STATS.slice(0, count).map((stat, i) =>
                  fakeNode(`demo-${i}`, { __typename: 'OT_StatItemBlock', ...stat, effect: s.effect }),
                ),
              }}
              displaySettings={displaySettings}
            />
          )

        return (
          <ColumnMock
            note="1 item renders as its own card; 2+ adjacent items merge into a 2-column grid that wraps into further rows (4 items -> 2x2)."
            left={preview}
            right={<PlaceholderCard />}
          />
        )
      }}
    </BlockPlayground>
  )
}
