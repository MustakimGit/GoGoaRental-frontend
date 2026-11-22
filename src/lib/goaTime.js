// All rental times are Goa time (IST, UTC+05:30, no daylight saving), whatever the viewer's own time zone is.
export const GOA_TZ = 'Asia/Kolkata'
export const RENTAL_DAY_START = '09:00'

/** "2026-11-09" + "14:30" → "2026-11-09T14:30:00+05:30", the format the API expects. */
export const toGoaIso = (date, time) => `${date}T${time}:00+05:30`

/** Today's date in Goa as "yyyy-mm-dd". */
export const goaToday = () => new Date().toLocaleDateString('en-CA', { timeZone: GOA_TZ })

/** Adds days to a "yyyy-mm-dd" date string. */
export function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** UTC ISO instant from the API → "Mon, 9 Nov, 9:00 am" in Goa time. */
export const formatGoaDateTime = (iso) =>
  new Date(iso.endsWith('Z') ? iso : `${iso}Z`).toLocaleString('en-IN', {
    timeZone: GOA_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

/** "yyyy-mm-dd" (a calendar date, no time) → "9 Nov 2026". */
export const formatDay = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' })

export const rupees = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount)
