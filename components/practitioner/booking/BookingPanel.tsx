'use client'

import { useMemo, useState } from 'react'
import type { PractitionerData } from '@/lib/practitioners'
import { formatBookingDuration } from '@/lib/practitionerFormat'
import {
  getAvailabilityWindow,
  type BookingDay,
  type BookingSlot,
} from '@/lib/bookingAvailability'
import { usePendingBooking, type PendingBooking } from '@/lib/useBookingRequest'
import BookingCalendar from './BookingCalendar'
import BookingTimeSlots from './BookingTimeSlots'
import BookingConfirmForm, { type BookingContactDetails } from './BookingConfirmForm'
import PendingAppointment from './PendingAppointment'

const WINDOW_BUSINESS_DAYS = 10
const SUBMIT_DELAY_MS = 750

type Props = {
  practitioner: PractitionerData
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

// ─── Booking panel ──────────────────────────────────────────────────────────────
//
// Locked slot beneath PractitionerHeader (see app/(site)/[...slug]/page.tsx),
// same architecture as the header itself: it renders whenever the referenced
// OT_PractitionerProfile has bookingEnabled set, and always reflects that
// record's current title/interval — never something an editor places or
// removes from the Visual Builder composition.
//
// A real month calendar (left) plus a side panel (right) whose content swaps
// between "pick a date first", that date's times, and the contact-details
// confirm step — the calendar itself never moves. No real scheduling backend:
// availability is generated once per practitioner (lib/bookingAvailability.ts,
// deterministic) and a submitted request is held in the visitor's own
// localStorage (lib/useBookingRequest.ts).

export default function BookingPanel({ practitioner }: Props) {
  const interval = practitioner.bookingInterval ?? '30'
  const title    = practitioner.bookingTitle?.trim() || 'Book an Appointment'
  const duration = formatBookingDuration(interval)

  const { mounted, pending, save, cancel } = usePendingBooking(practitioner.key)

  const days = useMemo(
    () => getAvailabilityWindow(practitioner.key, interval, WINDOW_BUSINESS_DAYS),
    [practitioner.key, interval],
  )
  const minMonth = startOfMonth(days[0].date)
  const maxMonth = startOfMonth(days[days.length - 1].date)

  const [monthCursor, setMonthCursor]   = useState(minMonth)
  const [selectedDay, setSelectedDay]   = useState<BookingDay | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)
  const [submitting, setSubmitting]     = useState(false)

  if (!practitioner.bookingEnabled) return null

  function handleSelectDay(day: BookingDay) {
    setSelectedDay(day)
    setSelectedSlot(null)
  }

  function handleSubmit(details: BookingContactDetails) {
    if (!selectedDay || !selectedSlot || submitting) return
    setSubmitting(true)
    window.setTimeout(() => {
      const booking: PendingBooking = {
        iso:          selectedSlot.iso,
        label:        selectedSlot.label,
        dateLabel:    selectedDay.dateLabel,
        weekdayLabel: selectedDay.weekdayLabel,
        interval,
        name:         details.name,
        email:        details.email,
        notes:        details.notes,
        requestedAt:  new Date().toISOString(),
      }
      save(booking)
      setSubmitting(false)
      setSelectedDay(null)
      setSelectedSlot(null)
    }, SUBMIT_DELAY_MS)
  }

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-md pt-lg pb-lg lg:px-xl lg:pt-lg lg:pb-2xl">
        {!mounted ? (
          <div className="h-40 animate-pulse rounded-ot-surface bg-fg/5" aria-hidden />
        ) : pending ? (
          <PendingAppointment pending={pending} onCancel={cancel} />
        ) : (
          <div aria-live="polite">
            <div className="mb-lg max-w-prose">
              <h2 className="text-title font-semibold leading-title text-fg">{title}</h2>
              <p className="mt-xs text-sm text-fg-muted">
                {duration} session — select a time that works for you.
              </p>
            </div>

            <div
              className="overflow-hidden rounded-ot-surface border border-fg/10 bg-surface"
              style={{ boxShadow: '0 24px 64px var(--ot-bloom-brand-faint), 0 4px 16px var(--ot-bloom-brand-faint)' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,1fr)]">
                <div className="p-lg lg:p-xl">
                  <BookingCalendar
                    days={days}
                    monthCursor={monthCursor}
                    selectedDate={selectedDay?.date ?? null}
                    onPrevMonth={() => setMonthCursor(m => (m > minMonth ? addMonths(m, -1) : m))}
                    onNextMonth={() => setMonthCursor(m => (m < maxMonth ? addMonths(m, 1) : m))}
                    canGoPrev={monthCursor > minMonth}
                    canGoNext={monthCursor < maxMonth}
                    onSelectDay={handleSelectDay}
                  />
                </div>

                <div className="flex flex-col justify-center border-t border-fg/10 p-lg lg:border-t-0 lg:border-l lg:p-xl">
                  {selectedDay && selectedSlot ? (
                    <BookingConfirmForm
                      day={selectedDay}
                      slot={selectedSlot}
                      interval={interval}
                      submitting={submitting}
                      onBack={() => setSelectedSlot(null)}
                      onSubmit={handleSubmit}
                    />
                  ) : (
                    <BookingTimeSlots
                      day={selectedDay}
                      selectedIso={selectedSlot?.iso ?? null}
                      onSelectSlot={setSelectedSlot}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
