import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_FeatureItemDefault = displayTemplate({
  key:         'OT_FeatureItemDefault',
  displayName: 'Feature Item',
  contentType: 'OT_FeatureItemBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },
    iconStyle: {
      displayName: 'Icon style',
      editor:      'select',
      sortOrder:   20,
      choices: {
        none:       { displayName: 'None (Default)',                  sortOrder: 10 },
        accent:     { displayName: 'Accent — inline before headline', sortOrder: 20 },
        structural: { displayName: 'Structural — above headline',     sortOrder: 30 },
      },
    },
    animate: {
      displayName: 'Fade in on scroll',
      editor:      'select',
      sortOrder:   30,
      choices: {
        true:  { displayName: 'On (Default)', sortOrder: 10 },
        false: { displayName: 'Off',          sortOrder: 20 },
      },
    },
  },
})
