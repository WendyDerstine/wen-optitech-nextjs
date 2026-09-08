import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_StatItemDefault = displayTemplate({
  key:         'OT_StatItemDefault',
  displayName: 'Stat Item',
  contentType: 'OT_StatItemBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        brand:   { displayName: 'Brand (Default)', sortOrder: 10 },
        canvas:  { displayName: 'Canvas',          sortOrder: 20 },
        surface: { displayName: 'Surface',         sortOrder: 30 },
      },
    },
    glass: {
      displayName: 'Glass overlay',
      editor:      'select',
      sortOrder:   20,
      choices: {
        false: { displayName: 'Off (Default)',                    sortOrder: 10 },
        true:  { displayName: 'On — frosted panel over bg color', sortOrder: 20 },
      },
    },
    iconPlacement: {
      displayName: 'Icon placement',
      editor:      'select',
      sortOrder:   30,
      choices: {
        inline: { displayName: 'Inline — left of label (default)', sortOrder: 10 },
        above:  { displayName: 'Above — centered above numeral',   sortOrder: 20 },
      },
    },
    animate: {
      displayName: 'Animate count-up on scroll',
      editor:      'select',
      sortOrder:   40,
      choices: {
        true:  { displayName: 'On (Default)', sortOrder: 10 },
        false: { displayName: 'Off',          sortOrder: 20 },
      },
    },
  },
})
