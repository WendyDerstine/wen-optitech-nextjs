'use client'

import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { formatBookingDuration } from '@/lib/practitionerFormat'
import type { BookingDay, BookingSlot } from '@/lib/bookingAvailability'
import type { BookingInterval } from '@/lib/practitioners'

const NOTES_MAX = 500
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type BookingContactDetails = {
  name:   string
  email:  string
  notes?: string
}

type Props = {
  day:        BookingDay
  slot:       BookingSlot
  interval:   BookingInterval
  submitting: boolean
  onBack:     () => void
  onSubmit:   (details: BookingContactDetails) => void
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// ─── Confirm step ───────────────────────────────────────────────────────────────
//
// Recap + contact details. Validates on blur (not on every keystroke) and
// again on submit; errors are conveyed by message + icon + border weight,
// never by color alone — this system has no dedicated error hue, so an
// accessible signal has to come from text and shape, not a borrowed red.

export default function BookingConfirmForm({ day, slot, interval, submitting, onBack, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({})

  const nameError = touched.name && !name.trim() ? 'Please enter your name.' : undefined
  const emailError = touched.email
    ? !email.trim()
      ? 'Please enter your email.'
      : !EMAIL_RE.test(email.trim())
        ? 'Please enter a valid email address.'
        : undefined
    : undefined

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true })
    if (!name.trim() || !EMAIL_RE.test(email.trim())) return
    onSubmit({ name: name.trim(), email: email.trim(), notes: notes.trim() || undefined })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="text-sm font-semibold text-fg">Confirm your appointment</p>

      <div className="mt-md rounded-ot-control border border-brand/20 bg-brand/8 px-md py-3">
        <p className="text-sm font-semibold text-fg">
          {formatFullDate(day.date)} at {slot.label}
        </p>
        <p className="mt-0.5 text-xs text-fg-muted">{formatBookingDuration(interval)} appointment</p>
      </div>

      <div className="mt-lg flex flex-col gap-md">
        <div>
          <label htmlFor="booking-name" className="mb-xs block text-label font-semibold uppercase tracking-label text-fg-muted">
            Name
          </label>
          <input
            id="booking-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'booking-name-error' : undefined}
            className={cn(
              'w-full rounded-ot-control border bg-canvas px-sm py-2 text-sm text-fg placeholder:text-fg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              nameError ? 'border-fg' : 'border-fg/15',
            )}
          />
          {nameError && (
            <p id="booking-name-error" className="mt-xs flex items-center gap-1 text-xs text-fg">
              <AlertCircle size={13} strokeWidth={2} aria-hidden /> {nameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="booking-email" className="mb-xs block text-label font-semibold uppercase tracking-label text-fg-muted">
            Email
          </label>
          <input
            id="booking-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="name@example.com"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'booking-email-error' : undefined}
            className={cn(
              'w-full rounded-ot-control border bg-canvas px-sm py-2 text-sm text-fg placeholder:text-fg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              emailError ? 'border-fg' : 'border-fg/15',
            )}
          />
          {emailError && (
            <p id="booking-email-error" className="mt-xs flex items-center gap-1 text-xs text-fg">
              <AlertCircle size={13} strokeWidth={2} aria-hidden /> {emailError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="booking-notes" className="mb-xs block text-label font-semibold uppercase tracking-label text-fg-muted">
            Notes (optional)
          </label>
          <textarea
            id="booking-notes"
            value={notes}
            onChange={e => setNotes(e.target.value.slice(0, NOTES_MAX))}
            placeholder="Anything you'd like to share before your appointment?"
            rows={3}
            className="w-full resize-none rounded-ot-control border border-fg/15 bg-canvas px-sm py-2 text-sm text-fg placeholder:text-fg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          />
        </div>
      </div>

      <div className="mt-lg flex flex-wrap items-center gap-md">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Requesting…' : 'Request appointment'}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-fg-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Choose a different time
        </button>
      </div>
    </form>
  )
}
