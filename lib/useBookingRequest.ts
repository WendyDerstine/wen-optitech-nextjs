'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BookingInterval } from '@/lib/practitioners'

// ─── Simulated appointment persistence ─────────────────────────────────────────
//
// No booking backend exists — a "request" is just written to the visitor's own
// localStorage, keyed by practitioner. Returning to that practitioner's page
// later (same browser, same device) shows the pending request in place of the
// booking flow. Clearing storage, switching browsers, or private browsing all
// mean no pending request is remembered — an accepted limitation of a
// client-only simulation, not a bug to work around.

export type PendingBooking = {
  iso:          string
  label:        string
  dateLabel:    string
  weekdayLabel: string
  interval:     BookingInterval
  name:         string
  email:        string
  notes?:       string
  requestedAt:  string
}

const STORAGE_PREFIX = 'sa-booking:'

function storageKey(practitionerKey: string): string {
  return `${STORAGE_PREFIX}${practitionerKey}`
}

function readPending(practitionerKey: string): PendingBooking | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(practitionerKey))
    return raw ? (JSON.parse(raw) as PendingBooking) : null
  } catch {
    return null
  }
}

/**
 * Reads/writes the one simulated pending appointment for a practitioner.
 * `mounted` distinguishes "still reading localStorage" from "confirmed empty"
 * so callers can render a neutral placeholder instead of flashing the booking
 * flow before swapping to a pending appointment (or vice versa).
 */
export function usePendingBooking(practitionerKey: string) {
  const [mounted, setMounted] = useState(false)
  const [pending, setPending] = useState<PendingBooking | null>(null)

  useEffect(() => {
    setPending(readPending(practitionerKey))
    setMounted(true)
  }, [practitionerKey])

  const save = useCallback((booking: PendingBooking) => {
    setPending(booking)
    try {
      window.localStorage.setItem(storageKey(practitionerKey), JSON.stringify(booking))
    } catch {
      // Storage unavailable (private browsing, quota) — the request still
      // "succeeds" for this visit; it just won't survive a reload.
    }
  }, [practitionerKey])

  const cancel = useCallback(() => {
    setPending(null)
    try {
      window.localStorage.removeItem(storageKey(practitionerKey))
    } catch {
      // ignore
    }
  }, [practitionerKey])

  return { mounted, pending, save, cancel }
}
