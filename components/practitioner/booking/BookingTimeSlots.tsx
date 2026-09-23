'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BookingDay, BookingSlot } from '@/lib/bookingAvailability'

type Props = {
  day:          BookingDay | null
  selectedIso:  string | null
  onSelectSlot: (slot: BookingSlot) => void
}

const SCROLL_STEP_RATIO = 0.85

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// ─── Time slots ─────────────────────────────────────────────────────────────────
//
// The right-hand pane: empty prompt until a day is picked on the calendar,
// then that day's times. The list still scrolls natively (wheel, touch,
// keyboard) but the scrollbar itself is hidden — a fading chevron affordance
// at whichever edge has more content takes its place, paging by one
// "screen's worth" of slots per click rather than requiring a drag.

export default function BookingTimeSlots({ day, selectedIso, onSelectSlot }: Props) {
  const listRef = useRef<HTMLUListElement>(null)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(true)

  function updateEdges() {
    const el = listRef.current
    if (!el) return
    setAtTop(el.scrollTop <= 1)
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
  }

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = 0
    updateEdges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.date])

  function scrollByPage(direction: 1 | -1) {
    listRef.current?.scrollBy({ top: direction * listRef.current.clientHeight * SCROLL_STEP_RATIO, behavior: 'smooth' })
  }

  if (!day) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-sm px-lg text-center">
        <CalendarDays size={28} strokeWidth={1.5} className="text-fg-muted/50" aria-hidden />
        <p className="text-sm text-fg-muted">Select a date to see available times.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-md text-sm font-semibold text-fg">{formatFullDate(day.date)}</p>

      <div className="relative">
        {!atTop && (
          <div
            aria-hidden={false}
            className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pb-3"
            style={{ background: 'linear-gradient(to bottom, var(--ot-surface) 45%, transparent)' }}
          >
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Show earlier times"
              className="pointer-events-auto mt-1 flex h-6 w-10 items-center justify-center rounded-ot-control border border-fg/15 bg-canvas text-fg-muted transition-colors duration-150 ease-quick hover:border-brand/50 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <ChevronUp size={14} strokeWidth={2} aria-hidden />
            </button>
          </div>
        )}

        <ul
          ref={listRef}
          onScroll={updateEdges}
          className="scrollbar-none flex max-h-96 flex-col gap-xs overflow-y-auto scroll-smooth"
        >
          {day.slots.map(slot => {
            const selected = slot.iso === selectedIso
            return (
              <li key={slot.iso}>
                <button
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  aria-pressed={selected}
                  className={cn(
                    'w-full rounded-ot-control border px-md py-3 text-sm font-medium transition-all duration-150 ease-quick',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                    selected
                      ? 'border-brand bg-brand text-fg-on-brand shadow-[0_4px_18px_var(--ot-bloom-brand-ring)]'
                      : 'border-fg/15 bg-canvas text-fg hover:-translate-y-0.5 hover:border-brand/50 hover:bg-brand/5 hover:shadow-[0_6px_16px_var(--ot-bloom-brand-faint)]',
                  )}
                >
                  {slot.label}
                </button>
              </li>
            )
          })}
        </ul>

        {!atBottom && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pt-3"
            style={{ background: 'linear-gradient(to top, var(--ot-surface) 45%, transparent)' }}
          >
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label="Show more times"
              className="pointer-events-auto mb-1 flex h-6 w-10 items-center justify-center rounded-ot-control border border-fg/15 bg-canvas text-fg-muted transition-colors duration-150 ease-quick hover:border-brand/50 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <ChevronDown size={14} strokeWidth={2} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
