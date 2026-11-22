export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export const COUNTRY_CODE = '+91'

/**
 * Reduces an Indian mobile number to its 10 digits, dropping spaces and any +91, 91 or 0 prefix.
 * Phone numbers are stored this way; the country code is only added for display and links.
 */
export function toLocalPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

/** "7709788010" → "+91 77097 88010". */
export function formatPhone(value) {
  if (!value) return ''
  const local = toLocalPhone(value)
  return local.length === 10 ? `${COUNTRY_CODE} ${local.slice(0, 5)} ${local.slice(5)}` : `${COUNTRY_CODE} ${local}`
}

/** tel: link with the country code, e.g. "tel:+917709788010". */
export const phoneHref = (value) => `tel:${COUNTRY_CODE}${toLocalPhone(value)}`

/** WhatsApp chat link; wa.me wants the number with country code and no "+". */
export const whatsappHref = (value) => `https://wa.me/${COUNTRY_CODE.slice(1)}${toLocalPhone(value)}`

/** "GA07AB1234" → "GA 07 AB 1234" for readability; stored without spaces. */
export function formatRegistration(reg) {
  const m = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/.exec(reg)
  return m ? [m[1], m[2], m[3], m[4]].filter(Boolean).join(' ') : reg
}
