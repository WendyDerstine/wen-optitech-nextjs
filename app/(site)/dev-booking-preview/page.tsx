import PractitionerHeader from '@/components/practitioner/PractitionerHeader'
import BookingPanel from '@/components/practitioner/booking/BookingPanel'
import type { PractitionerData } from '@/lib/practitioners'

// TEMPORARY — visual QA scratch page for the booking feature. Not linked from
// navigation, not a showcase entry. Delete before merging.

const BASE = {
  suffix: 'MD',
  credentials: 'MD, FACC',
  headshotUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
  bio: { html: '<p>Preview fixture.</p>' },
  practiceAreas: [{ areaName: 'Cardiology', facility: 'Memorial Heart Center', isPrimary: true }],
  phone: '(312) 555-0142',
  email: 'preview@example.com',
  officeLocation: 'Chicago, IL',
  languages: 'English, Spanish',
}

const PRACTITIONERS: PractitionerData[] = [
  { ...BASE, key: 'open-week', firstName: 'Elena', lastName: 'Vargas', title: 'Chief of Cardiology',
    url: '', bookingEnabled: true, bookingTitle: 'Book a Consultation', bookingInterval: '30' },
  { ...BASE, key: 'busy-week', firstName: 'Marcus', lastName: 'Bell', title: 'Director, Medical Oncology', headshotUrl: undefined,
    url: '', bookingEnabled: true, bookingTitle: 'Schedule an Appointment', bookingInterval: '60' },
  { ...BASE, key: 'sparse-week', firstName: 'Priya', lastName: 'Nair', title: 'Attending Physician', headshotUrl: undefined,
    url: '', bookingEnabled: true, bookingTitle: '', bookingInterval: '15' },
]

export default function DevBookingPreview() {
  return (
    <div>
      {PRACTITIONERS.map(p => (
        <div key={p.key} className="border-b-4 border-dashed border-accent">
          <PractitionerHeader practitioner={p} />
          <BookingPanel practitioner={p} />
        </div>
      ))}
    </div>
  )
}
