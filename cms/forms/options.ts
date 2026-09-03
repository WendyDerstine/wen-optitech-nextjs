export type FormOption = { caption: string; value: string; checked: boolean }

export function parseOptions(raw: unknown): FormOption[] {
  let source: unknown = raw

  // Unwrap JSON string if the CMS returned it serialized
  if (typeof source === 'string') {
    try { source = JSON.parse(source) } catch { return [] }
  }

  // Handle Optimizely OptionListProperty's { items: [...] } envelope
  if (!Array.isArray(source) && Array.isArray((source as any)?.items)) {
    source = (source as any).items
  }

  if (!Array.isArray(source)) return []

  // Optimizely Forms' real shape is { label, value, selected } — confirmed
  // live against the CMS. { caption, checked } kept as a fallback in case a
  // future Forms version (or a different content source) uses that instead.
  return (source as any[])
    .filter(o => typeof o?.label === 'string' || typeof o?.caption === 'string')
    .map(o => ({
      caption: String(o.label ?? o.caption),
      value:   String(o.value ?? o.label ?? o.caption),
      checked: o.selected === true || o.checked === true,
    }))
}
