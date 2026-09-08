'use client'

import type { ReactNode } from 'react'

/**
 * Mocks the "blank row, 2 columns" scenario these Item elements exist for —
 * one column holds the element(s) under test, the other a placeholder card,
 * so the showcase demonstrates the actual motivating layout rather than the
 * element floating alone on the page.
 */
export function ColumnMock({ left, right, note }: { left: ReactNode; right: ReactNode; note?: string }) {
  return (
    <div className="px-md py-lg lg:px-lg">
      {note && (
        <p className="text-label text-fg-muted/60 mb-md max-w-[65ch]">{note}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg items-start">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    </div>
  )
}

/** Stand-in for a Card element placed in the sibling column — not the real CardBlock. */
export function PlaceholderCard() {
  return (
    <div className="rounded-ot-surface border border-fg/10 bg-surface p-lg h-full flex flex-col gap-xs">
      <p className="text-label tracking-label uppercase text-fg-muted/50 font-semibold">Card (placeholder)</p>
      <h3 className="text-title leading-title font-semibold text-fg">Whatever sits in the other column</h3>
      <p className="text-body leading-body text-fg-muted">
        Any other element — a Card, another Item, or a Form field — can share this row.
      </p>
    </div>
  )
}
