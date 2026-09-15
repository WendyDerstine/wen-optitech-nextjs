'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { formatBookingDuration } from '@/lib/practitionerFormat'
import type { PendingBooking } from '@/lib/useBookingRequest'

type Props = {
  pending:  PendingBooking
  onCancel: () => void
}

// A small torn-calendar-page badge — the month banner in brand, the day as
// the dominant numeral — echoes the date without repeating it verbatim; the
// heading alongside still carries the weekday and time the badge can't.
function CalendarBadge({ date }: { date: Date }) {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  return (
    <div
      className="flex w-20 flex-none flex-col overflow-hidden rounded-ot-control border border-fg/15 bg-canvas text-center"
      style={{ boxShadow: '0 12px 32px var(--ot-bloom-brand-faint)' }}
    >
      <div className="bg-brand py-1 text-[0.6875rem] font-bold uppercase tracking-label text-fg-on-brand">
        {month}
      </div>
      <div className="py-3 text-3xl font-extrabold leading-none text-fg">{date.getDate()}</div>
    </div>
  )
}

// ─── Pending appointment ────────────────────────────────────────────────────────
//
// Replaces the booking flow entirely once a request exists. Sits in the same
// bloom-shadowed console as the calendar flow it replaced, so the two states
// read as one continuous surface rather than a downgrade. Cancel is a real,
// deliberate action (kinetic fill on confirm) with an inline undo step first
// — not a dialog, but not a bare text link either.

export default function PendingAppointment({ pending, onCancel }: Props) {
  const [confirming, setConfirming] = useState(false)
  const date = new Date(pending.iso)

  return (
    <div
      className="motion-safe:animate-fade-in overflow-hidden rounded-ot-surface border border-fg/10 bg-surface"
      style={{ boxShadow: '0 24px 64px var(--ot-bloom-brand-faint), 0 4px 16px var(--ot-bloom-brand-faint)' }}
      aria-live="polite"
    >
      <div className="flex flex-col gap-lg p-lg sm:flex-row sm:items-start lg:p-xl">
        <CalendarBadge date={date} />

        <div className="min-w-0 flex-1">
          <p className="text-label font-semibold uppercase tracking-label text-brand">
            Appointment requested
          </p>
          <h2 className="mt-xs text-title font-semibold leading-title text-fg">
            {pending.weekdayLabel}, {pending.dateLabel} at {pending.label}
          </h2>
          <p className="mt-xs text-sm text-fg-muted">
            {formatBookingDuration(pending.interval)} appointment for {pending.name}
          </p>
          <p className="mt-1 text-xs text-fg-muted">Confirmation will be sent to {pending.email}</p>

          {pending.notes && (
            <p className="mt-md text-sm italic text-fg-muted">“{pending.notes}”</p>
          )}

          <div className="mt-lg border-t border-fg/10 pt-md">
            {!confirming ? (
              <Button variant="hover-fill" size="sm" onClick={() => setConfirming(true)}>
                Cancel request
              </Button>
            ) : (
              <div className="motion-safe:animate-fade-in flex flex-wrap items-center gap-md">
                <span className="text-sm text-fg">Cancel this request?</span>
                <Button variant="signal" size="sm" onClick={onCancel}>
                  Cancel request
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Keep appointment
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
