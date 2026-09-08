import { contentType } from '@optimizely/cms-sdk'
import { ICON_ENUM_WITH_NONE } from '../display-templates/_shared/iconChoices'

/**
 * OT_FeatureItemBlock — a single feature tile placeable as an element inside
 * a Visual Builder column. Distinct from OT_FeatureItem, which only exists as
 * an array item inside the OT_FeatureGridBlock section — this type carries no
 * nested array, so it can safely be elementEnabled.
 *
 * Kept as elementEnabled only (never sectionEnabled) — see OT_StatItemBlock
 * for why the section/element pair must stay mutually exclusive.
 */
export const OT_FeatureItemBlock = contentType({
  key:                  'OT_FeatureItemBlock',
  displayName:          'Feature Item',
  description:          'Single feature tile for a column — headline, body, and optional CTA. For a full-width feature grid, use Feature Grid Block instead.',
  baseType:             '_component',
  compositionBehaviors: ['elementEnabled'],
  properties: {
    headline: {
      type:        'string',
      isLocalized: true,
      maxLength:   80,
      displayName: 'Headline',
      group:       'OT_Content',
      sortOrder:   10,
      indexingType: 'searchable',
    },
    body: {
      type:        'richText',
      isLocalized: true,
      displayName: 'Body',
      description: '1–2 sentences describing this feature.',
      group:       'OT_Content',
      sortOrder:   20,
      indexingType: 'searchable',
    },
    icon: {
      type:        'string',
      format:      'selectOne',
      displayName: 'Icon',
      description: 'Optional icon shown with the headline.',
      enum:        ICON_ENUM_WITH_NONE,
      group:       'OT_Content',
      sortOrder:   30,
    },
    ctaLabel: {
      type:        'string',
      isLocalized: true,
      maxLength:   40,
      displayName: 'CTA Label',
      description: "e.g. 'Learn more'",
      group:       'OT_Content',
      sortOrder:   40,
    },
    ctaUrl: {
      type:         'url',
      displayName:  'CTA URL',
      isLocalized:  true,
      group:        'OT_Content',
      sortOrder:    50,
    },
  },
})
