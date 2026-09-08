import { contentType } from '@optimizely/cms-sdk'
import { ICON_ENUM_WITH_NONE } from '../display-templates/_shared/iconChoices'

/**
 * OT_TabItemBlock — a single tab panel placeable as an element inside a
 * Visual Builder column. Distinct from OT_TabItem, which only exists as an
 * array item inside the OT_TabsBlock section — this type carries no nested
 * array, so it can safely be elementEnabled.
 *
 * Two or more of these placed adjacently in the same column render together
 * as one tab switcher (grouped by cms/compositions/Column.tsx — see
 * groupAdjacentComponents). A single one still renders inside the same
 * tabbed chrome rather than as a bare panel. Settings on this display
 * template only take effect when this item is first in an adjacent run —
 * later items' style settings are ignored (their content fields still are
 * not).
 *
 * Kept as elementEnabled only (never sectionEnabled) — see OT_StatItemBlock
 * for why the section/element pair must stay mutually exclusive.
 */
export const OT_TabItemBlock = contentType({
  key:                  'OT_TabItemBlock',
  displayName:          'Tab Item',
  description:          'Single tab panel for a column. Place two or more adjacently to get a real tab switcher; a lone one still renders in tabbed chrome. For a full-width tab set with its own heading, use Tabs Block instead.',
  baseType:             '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    tabStyle: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Tab Style',
      description: 'Only applies when this item leads an adjacent group of Tab Items in a column.',
      enum: [
        { value: 'underline', displayName: 'Underline (Default)' },
        { value: 'pill', displayName: 'Pill' },
        { value: 'buttonGroup', displayName: 'Button Group' },
      ],
      group: 'OT_Content',
      sortOrder: 5,
    },
    tabLabel: {
      type:        'string',
      displayName: 'Tab Label',
      description: 'The trigger text shown on the tab. Keep under 24 characters.',
      isLocalized: true,
      maxLength:   24,
      group:       'OT_Content',
      sortOrder:   10,
    },
    tabIcon: {
      type:        'string',
      displayName: 'Tab Icon',
      description: 'Optional icon shown alongside the tab label.',
      format:      'selectOne',
      enum:        ICON_ENUM_WITH_NONE,
      group:     'OT_Content',
      sortOrder: 20,
      // Not localized — icon choice is structural, not language-dependent
    },
    heading: {
      type:        'string',
      displayName: 'Panel Heading',
      description: 'Optional headline inside the tab panel. Leave blank for body-only panels.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   30,
      indexingType: 'searchable',
    },
    body: {
      type:        'richText',
      displayName: 'Panel Body',
      description: 'Primary panel content. Supports bold, italic, links, and lists.',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   40,
      indexingType: 'searchable',
    },
    image: {
      type:         'contentReference',
      displayName:  'Panel Image',
      description:  'Optional image. Only renders when Content Layout is set to Image Right or Image Left.',
      allowedTypes: ['_image'],
      group:        'OT_Content',
      sortOrder:    50,
      // Not localized — media references are shared across locales
    },
    ctaLabel: {
      type:        'string',
      displayName: 'CTA Label',
      description: 'Optional button label. Requires CTA URL to be set.',
      isLocalized: true,
      maxLength:   40,
      group:       'OT_Content',
      sortOrder:   60,
    },
    ctaUrl: {
      type:        'url',
      displayName: 'CTA URL',
      description: 'Destination URL for the CTA button. Can be locale-specific (e.g. /en/page vs /de/seite).',
      isLocalized: true,
      group:       'OT_Content',
      sortOrder:   70,
    },
  },
})
