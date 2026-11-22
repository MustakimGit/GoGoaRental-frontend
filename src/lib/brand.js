// The logo file in /public has spaces in its name, so it is referenced URL-encoded.
export const LOGO_URL = '/GoGoa%20Rentals%20%20Logo.png'
export const BRAND_NAME = 'GoGoa Rentals'

// Indian mobile number without the country code; +91 is added wherever it is shown or dialled.
export const CONTACT_PHONE = '7709788010'

// WhatsApp number that receives booking requests (until online booking ships). Same as the contact number for now.
export const BOOKING_WHATSAPP = CONTACT_PHONE

// Shortest rental we accept, in rental days (9 am to 9 am). Shown in the header; Book is blocked below it.
export const MIN_RENTAL_DAYS = 2

// Lowest daily price, shown as "from ₹1,100/day" in marketing copy.
export const STARTING_PRICE_PER_DAY = 1100
