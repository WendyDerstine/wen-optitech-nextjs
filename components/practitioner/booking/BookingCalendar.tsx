import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMonthGrid, formatMonthLabel, isSameDay, type BookingDay } from '@/lib/bookingAvailability'

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Props = {
  days:         BookingDay[]
  monthCursor:  Date
  selectedDate: Date | null
  onPrevMonth:  () => void
  onNextMonth:  () => void
  canGoPrev:    boolean
  canGoNext:    boolean
  onSelectDay:  (day: BookingDay) => void
}

// ─── Calendar ───────────────────────────────────────────────────────────────────
//
// A real month grid, Calendly-style: every day is visible at once, available
// days read clearly (a brand dot beneath the date) against muted/disabled
// past, out-of-window, and adjacent-month days. Selecting a day doesn't
// navigate anywhere — it just tells BookingPanel which day's times to show
// in the side panel, so the whole flow stays on one screen.

export default function BookingCalendar({
  days,
  monthCursor,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  canGoPrev,
  canGoNext,
  onSelectDay,
}: Props) {
  const grid = getMonthGrid(monthCursor)
  const today = new Date()

  return (
    <div>
      <div className="mb-lg flex items-center justify-between">
        <p className="text-title font-semibold text-fg">{formatMonthLabel(monthCursor)}</p>
        <div className="flex items-center gap-xs">
          <button
            type="button"
            onClick={onPrevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-ot-control border border-fg/15 text-fg transition-colors duration-150 ease-quick hover:border-brand/50 hover:text-brand disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!canGoNext}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-ot-control border border-fg/15 text-fg transition-colors duration-150 ease-quick hover:border-brand/50 hover:text-brand disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_HEADERS.map(w => (
          <div key={w} className="pb-sm text-center text-xs font-semibold uppercase tracking-label text-fg-muted">
            {w}
          </div>
        ))}

        {grid.map(cellDate => {
          const inMonth = cellDate.getMonth() === monthCursor.getMonth()
          const bookingDay = days.find(d => isSameDay(d.date, cellDate))
          const available = !!bookingDay && bookingDay.slots.length > 0
          const isToday = isSameDay(cellDate, today)
          const isSelected = !!selectedDate && isSameDay(cellDate, selectedDate)

          if (!inMonth) {
            return <div key={cellDate.toISOString()} aria-hidden className="aspect-square" />
          }

          if (!available) {
            return (
              <div
                key={cellDate.toISOString()}
                className={cn(
                  'flex aspect-square items-center justify-center text-sm',
                  bookingDay ? 'text-fg-muted/40' : 'text-fg-muted/20',
                )}
              >
                {cellDate.getDate()}
              </div>
            )
          }

          return (
            <button
              key={cellDate.toISOString()}
              type="button"
              onClick={() => onSelectDay(bookingDay!)}
              aria-pressed={isSelected}
              aria-label={`${cellDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — available`}
              className={cn(
                'group relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-ot-control text-sm font-medium transition-all duration-150 ease-quick',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                isSelected
                  ? 'bg-brand text-fg-on-brand shadow-[0_4px_18px_var(--ot-bloom-brand-ring)]'
                  : 'text-fg hover:-translate-y-0.5 hover:bg-brand/10 hover:shadow-[0_6px_16px_var(--ot-bloom-brand-faint)]',
                isToday && !isSelected && 'ring-1 ring-inset ring-brand/50',
              )}
            >
              {cellDate.getDate()}
              <span
                aria-hidden
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isSelected ? 'bg-fg-on-brand' : 'bg-brand group-hover:bg-brand',
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
