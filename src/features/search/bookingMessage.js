import { BOOKING_WHATSAPP, BRAND_NAME } from '@/lib/brand'
import { formatPhone, whatsappHref } from '@/lib/format'
import { formatGoaDateTime, rupees } from '@/lib/goaTime'

// Categories are "Two-wheeler" / "Four-wheeler".
const vehicleEmoji = (category) => (/two|scooter|bike|moto/i.test(category) ? '🛵' : '🚗')

/**
 * Builds the WhatsApp booking-request message for a quote. WhatsApp renders *text* as bold.
 * Interim flow until online booking (Phase 4): the customer sends this to our booking number.
 */
export function bookingMessage(quote, { mode, dropName }, user) {
  const delivery = mode === 'Delivery'
  const lines = [
    `🌴 *New Booking Request – ${BRAND_NAME}* 🌴`,
    '',
    '📋 *Trip details*',
    `${vehicleEmoji(quote.categoryName)} *Vehicle:* ${quote.vehicleTypeName} (${quote.categoryName})`,
    delivery ? `🚚 *Delivery near:* ${quote.pickupLocationName}` : `📍 *Pickup point:* ${quote.pickupLocationName}`,
    `🏁 *Drop point:* ${dropName || 'Same as pickup point'}`,
    `🟢 *Pickup:* ${formatGoaDateTime(quote.pickupAtUtc)}`,
    `🔴 *Return:* ${formatGoaDateTime(quote.returnAtUtc)}`,
    `📅 *Rental days:* ${quote.rentalDays}`,
    '',
    '💰 *Price details*',
    `🏷️ Rental: ${rupees(quote.rentalPrice)}`,
  ]
  if (quote.deliveryFee > 0) lines.push(`🚚 Delivery: ${rupees(quote.deliveryFee)}`)
  if (quote.taxAmount > 0) lines.push(`🧾 Taxes: ${rupees(quote.taxAmount)}`)
  if (quote.depositAmount > 0) lines.push(`🔒 Refundable deposit: ${rupees(quote.depositAmount)}`)
  lines.push(`✅ *Total: ${rupees(quote.totalAmount)}*`)
  if (dropName && dropName !== quote.pickupLocationName) {
    lines.push('ℹ️ _Different drop point – please confirm any extra charge._')
  }

  lines.push('', '👤 *My details*')
  if (user) {
    lines.push(`🙋 Name: ${user.name}`)
    if (user.phone) lines.push(`📱 Mobile: ${formatPhone(user.phone)}`)
    if (user.email) lines.push(`✉️ Email: ${user.email}`)
  } else {
    lines.push('🙋 Name: ')
  }

  lines.push('', '🙏 Please confirm availability. Thank you!')
  return lines.join('\n')
}

/** wa.me link that opens WhatsApp (app on phones, WhatsApp Web on desktop) with the message filled in. */
export const bookingWhatsappHref = (quote, trip, user) =>
  `${whatsappHref(BOOKING_WHATSAPP)}?text=${encodeURIComponent(bookingMessage(quote, trip, user))}`
