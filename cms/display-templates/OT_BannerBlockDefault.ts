import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_BannerBlockDefault = displayTemplate({
  key:         'OT_BannerBlockDefault',
  displayName: 'Banner Block',
  contentType: 'OT_BannerBlock',
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background color',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:      { displayName: 'Canvas (Default)',   sortOrder: 10 },
        surface:     { displayName: 'Surface',            sortOrder: 20 },
        brand:       { displayName: 'Brand',              sortOrder: 30 },
        brand_hover: { displayName: 'Brand Deep',         sortOrder: 40 },
        accent:      { displayName: 'Accent',             sortOrder: 50 },
        fg_on_brand: { displayName: 'White / Light',      sortOrder: 60 },
        fg:          { displayName: 'Foreground (dark)',  sortOrder: 70 },
        fg_muted:    { displayName: 'Muted',              sortOrder: 80 },
      },
    },
    textColor: {
      displayName: 'Text color',
      editor:      'select',
      sortOrder:   15,
      choices: {
        auto:          { displayName: 'Auto — follows background (Default)', sortOrder: 10 },
        fg_on_brand:   { displayName: 'White / Light (fg-on-brand)',         sortOrder: 20 },
        fg:            { displayName: 'Default (fg)',                         sortOrder: 30 },
        fg_muted:      { displayName: 'Muted (fg-muted)',                    sortOrder: 40 },
        brand:         { displayName: 'Brand',                               sortOrder: 50 },
        brand_hover:   { displayName: 'Brand Deep',                          sortOrder: 60 },
        accent:        { displayName: 'Accent',                              sortOrder: 70 },
        surface:       { displayName: 'Surface',                             sortOrder: 80 },
        canvas:        { displayName: 'Canvas',                              sortOrder: 90 },
      },
    },
    alignment: {
      displayName: 'Content alignment',
      editor:      'select',
      sortOrder:   30,
      choices: {
        center: { displayName: 'Center (Default)', sortOrder: 10 },
        left:   { displayName: 'Left',             sortOrder: 20 },
      },
    },
    size: {
      displayName: 'Height',
      editor:      'select',
      sortOrder:   40,
      choices: {
        large:   { displayName: 'Large (Default)', sortOrder: 10 },
        compact: { displayName: 'Compact',         sortOrder: 20 },
        display: { displayName: 'Display',         sortOrder: 30 },
      },
    },
    treatment: {
      displayName: 'Image treatment',
      editor:      'select',
      sortOrder:   45,
      choices: {
        scrim: { displayName: 'Scrim — color overlay (Default)', sortOrder: 10 },
        glass: { displayName: 'Glass — frosted panel',           sortOrder: 20 },
        flat:  { displayName: 'Flat — solid color, no image',    sortOrder: 30 },
        none:  { displayName: 'None — photo only, no overlay',   sortOrder: 40 },
      },
    },
    imageBlend: {
      displayName: 'Image blend',
      editor:      'select',
      sortOrder:   50,
      choices: {
        overlay:  { displayName: 'Overlay (Default)', sortOrder: 10 },
        multiply: { displayName: 'Multiply',          sortOrder: 20 },
      },
    },
  },
})
