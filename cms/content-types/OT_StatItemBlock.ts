import { contentType } from '@optimizely/cms-sdk'
import { ICON_ENUM_WITH_NONE } from '../display-templates/_shared/iconChoices'

/**
 * OT_StatItemBlock — a single metric callout placeable as an element inside
 * a Visual Builder column (e.g. two of these stacked beside a Card in a
 * blank 2-column row). Distinct from OT_StatItem, which only exists as an
 * array item inside the OT_StatBlock section — this type carries no nested
 * array, so it can safely be elementEnabled.
 *
 * Kept as elementEnabled only (never sectionEnabled) so it never appears
 * alongside OT_StatBlock in the same "add content" picker — the names are
 * close enough to confuse editors if both showed up as elements or both as
 * sections.
 */
export const OT_StatItemBlock = contentType({
  key:                  'OT_StatItemBlock',
  displayName:          'Stat Item',
  description:          'Single metric callout for a column — value, label, and optional context. For a full-width row of stats, use Stat Block instead.',
  baseType:             '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    value: {
      type:        'string',
      maxLength:   20,
      displayName: 'Value',
      description: 'The metric value — e.g. "40%", "2M+", "$4.2B", "99.99%"',
      group:       'OT_Content',
      sortOrder:   10,
    },
    label: {
      type:        'string',
      isLocalized: true,
      maxLength:   80,
      displayName: 'Label',
      description: 'Short descriptor shown below the value. e.g. "Faster deployment"',
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    context: {
      type:        'string',
      isLocalized: true,
      maxLength:   120,
      displayName: 'Context',
      description: 'Optional supporting line. e.g. "vs. industry average"',
      group:       'OT_Content',
      sortOrder:   30,
      indexingType: 'searchable',
    },
    icon: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Icon',
      description: 'Optional icon shown alongside the value.',
      enum:        ICON_ENUM_WITH_NONE,
      group:       'OT_Content',
      sortOrder:   40,
      // Not localized — icon choice is structural, not language-dependent
    },
    effect: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Numeral effect',
      description: 'Visual treatment applied to the stat numeral. Works in all colour modes.',
      group:       'OT_Content',
      sortOrder:   50,
      enum: [
        { value: 'none',     displayName: 'None — flat colour (default)' },
        { value: 'gradient', displayName: 'Gradient — brand-to-accent diagonal fill' },
        { value: 'glow',     displayName: 'Glow — backlit bloom behind the numeral' },
      ],
    },
  },
})
