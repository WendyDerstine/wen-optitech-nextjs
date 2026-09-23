import type { BookingInterval } from '@/lib/practitioners'

// ─── Simulated availability generator ──────────────────────────────────────────
//
// Pure and deterministic: the same practitioner key + interval always produces
// the same schedule shape. No Math.random(), no Date.now() beyond finding
// "today" as the window's starting point — so repeat visits on the same day
// see an identical calendar, and different practitioners land on distinctly
// different personalities (one habitually wide open, another mostly booked)
// without ever being reseeded on refresh.
//
// Two seeded layers create the variety the brief asked for:
//   1. A per-practitioner "busyness" scalar biases every weekday toward more
//      open or more booked archetypes — this is what produces some people
//      reading as full-week-open and others as sparse-single-slot.
//   2. A per-weekday archetype (stable across both calendar weeks) gives each
//      person a consistent weekly rhythm, while a week-scoped sub-seed still
//      varies the exact chosen times so paging to week two doesn't just
//      mirror week one.

const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR   = 17
const WEEKDAYS_PER_WEEK   = 5

export type BookingSlot = {
  iso:   string
  date:  Date
  label: string
}

export type BookingDay = {
  date:         Date
  weekdayLabel: string
  dateLabel:    string
  isToday:      boolean
  slots:        BookingSlot[]
}

type Archetype = 'full' | 'moderate' | 'sparse' | 'none'

// FNV-1a — small, dependency-free, good enough distribution for a seed.
function hashSeed(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// mulberry32 — small deterministic PRNG from a 32-bit seed.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function nextBusinessDays(count: number, from: Date): Date[] {
  const days: Date[] = []
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  while (days.length < count) {
    const dow = cur.getDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

// busyness 0 (wide open) .. 1 (heavily booked) shifts every threshold, so a
// low-busyness practitioner lands on 'full' far more often than 'none'.
function archetypeForDay(rand: () => number, busyness: number): Archetype {
  const r = rand()
  if (r < 0.60 - 0.40 * busyness) return 'full'
  if (r < 0.85 - 0.30 * busyness) return 'moderate'
  if (r < 0.97 - 0.10 * busyness) return 'sparse'
  return 'none'
}

function chooseSlotIndices(rand: () => number, archetype: Archetype, indices: number[]): number[] {
  switch (archetype) {
    case 'none':
      return []
    case 'sparse':
      return [indices[Math.floor(rand() * indices.length)]]
    case 'moderate':
      return indices.filter(() => rand() < 0.45)
    case 'full':
    default:
      return indices.filter(() => rand() < 0.88)
  }
}

function formatWeekday(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: date.getMinutes() ? '2-digit' : undefined })
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/**
 * Returns `businessDayCount` weekdays (default 10, i.e. two weeks) starting
 * from `from`, each carrying its deterministically generated slot list.
 */
export function getAvailabilityWindow(
  practitionerKey: string,
  interval: BookingInterval = '30',
  businessDayCount = 10,
  from: Date = new Date(),
): BookingDay[] {
  const minutes     = Number(interval) || 30
  const totalMinutes = (BUSINESS_END_HOUR - BUSINESS_START_HOUR) * 60
  const slotCount    = Math.floor(totalMinutes / minutes)
  const slotIndices  = Array.from({ length: slotCount }, (_, i) => i)

  const seed      = hashSeed(practitionerKey || 'practitioner')
  const busyness  = mulberry32(seed)() // stable per-practitioner "personality"
  const today     = new Date()
  const days      = nextBusinessDays(businessDayCount, from)

  return days.map((date, i) => {
    const weekdayIndex = (date.getDay() + 6) % 7 // Mon=0 .. Fri=4
    const weekIndex     = Math.floor(i / WEEKDAYS_PER_WEEK)

    // Stable per weekday (so "Thursdays are wide open" holds across weeks).
    const archetype = archetypeForDay(mulberry32(seed ^ Math.imul(weekdayIndex + 1, 0x9e3779b1)), busyness)

    // Varies per week so week two isn't an exact mirror of week one.
    const slotRand = mulberry32(seed ^ Math.imul(weekdayIndex + 1, 0x9e3779b1) ^ Math.imul(weekIndex + 1, 0x85ebca6b))
    const chosen   = chooseSlotIndices(slotRand, archetype, slotIndices).sort((a, b) => a - b)

    const slots: BookingSlot[] = chosen.map(idx => {
      const slotDate = new Date(date)
      const startMinutes = BUSINESS_START_HOUR * 60 + idx * minutes
      slotDate.setHours(0, startMinutes, 0, 0)
      return {
        iso:   slotDate.toISOString(),
        date:  slotDate,
        label: formatTimeLabel(slotDate),
      }
    })

    return {
      date,
      weekdayLabel: formatWeekday(date),
      dateLabel:    formatDateLabel(date),
      isToday:      isSameDay(date, today),
      slots,
    }
  })
}

/**
 * Every calendar cell needed to render `monthCursor`'s month as a full
 * Sun–Sat grid, padded with the trailing days of the prior month and the
 * leading days of the next so every row is complete — exactly as many rows
 * as the month needs (5 or 6), no dead trailing week.
 */
export function getMonthGrid(monthCursor: Date): Date[] {
  const year  = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth   = new Date(year, month + 1, 0)
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())
  const gridEnd   = new Date(year, month, lastOfMonth.getDate() + (6 - lastOfMonth.getDay()))

  const days: Date[] = []
  const cur = new Date(gridStart)
  while (cur <= gridEnd) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
