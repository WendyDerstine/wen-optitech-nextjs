'use client'

import { BlockPlayground } from '../playground'
import OT_BannerBlock from '@/cms/components/OT_BannerBlock'

const BANNER_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop'

const DEMO_CONTENT = {
  heading:           'Confidence is a competitive advantage.',
  eyebrow:           'The platform',
  body:              { html: '<p>Stop launching and hoping. Start launching and knowing. Real-time data means every decision is an informed one.</p>' },
  primaryCtaLabel:   'Book a demo',
  primaryCtaUrl:     { default: '#' },
  secondaryCtaLabel: 'See pricing',
  secondaryCtaUrl:   { default: '#' },
}

export default function BannerPlayground() {
  return (
    <BlockPlayground
      defaults={{ treatment: 'scrim', color: 'canvas', alignment: 'center', size: 'large', image: 'yes', textColor: 'auto' }}
      controls={[
        {
          type: 'buttons',
          key: 'treatment',
          label: 'Overlay',
          options: [
            { label: 'Scrim', value: 'scrim' },
            { label: 'Glass', value: 'glass' },
            { label: 'Flat',  value: 'flat'  },
          ],
        },
        {
          type: 'buttons',
          key: 'color',
          label: 'Color',
          options: [
            { label: 'Canvas',   value: 'canvas'      },
            { label: 'Surface',  value: 'surface'     },
            { label: 'Brand',    value: 'brand'       },
            { label: 'Deep',     value: 'brand_hover' },
            { label: 'Accent',   value: 'accent'      },
            { label: 'White',    value: 'fg_on_brand' },
            { label: 'Fg',       value: 'fg'          },
            { label: 'Muted',    value: 'fg_muted'    },
          ],
        },
        {
          type: 'buttons',
          key: 'alignment',
          label: 'Align',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Left',   value: 'left'   },
          ],
        },
        {
          type: 'buttons',
          key: 'size',
          label: 'Size',
          options: [
            { label: 'Large',   value: 'large'   },
            { label: 'Compact', value: 'compact' },
          ],
        },
        {
          type: 'buttons',
          key: 'image',
          label: 'Image',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No',  value: 'no'  },
          ],
        },
        {
          type: 'buttons',
          key: 'textColor',
          label: 'Text',
          options: [
            { label: 'Auto',    value: 'auto'        },
            { label: 'White',   value: 'fg_on_brand' },
            { label: 'Default', value: 'fg'          },
            { label: 'Muted',   value: 'fg_muted'    },
            { label: 'Brand',   value: 'brand'       },
            { label: 'Accent',  value: 'accent'      },
            { label: 'Surface', value: 'surface'     },
            { label: 'Canvas',  value: 'canvas'      },
          ],
        },
      ]}
    >
      {s => (
        <OT_BannerBlock
          content={s.image === 'yes' ? { ...DEMO_CONTENT, backgroundImage: BANNER_IMG } as any : DEMO_CONTENT as any}
          displaySettings={{ treatment: s.treatment, color: s.color, alignment: s.alignment, size: s.size, imageBlend: 'overlay', textColor: s.textColor }}
        />
      )}
    </BlockPlayground>
  )
}
