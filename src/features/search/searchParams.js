import { MIN_RENTAL_DAYS } from '@/lib/brand'
import { addDays, goaToday, RENTAL_DAY_START } from '@/lib/goaTime'

/** Search criteria live in the URL so results pages can be shared and reloaded. Defaults: tomorrow 9 am, the minimum rental. */
export function readSearchParams(params) {
  const tomorrow = addDays(goaToday(), 1)
  return {
    location: params.get('location') ?? '',
    // Where the customer returns the vehicle; '' means the same as the pickup point.
    drop: params.get('drop') ?? '',
    mode: params.get('mode') === 'Delivery' ? 'Delivery' : 'SelfPickup',
    pickupDate: params.get('pickupDate') ?? tomorrow,
    pickupTime: params.get('pickupTime') ?? RENTAL_DAY_START,
    returnDate: params.get('returnDate') ?? addDays(tomorrow, MIN_RENTAL_DAYS),
    returnTime: params.get('returnTime') ?? RENTAL_DAY_START,
  }
}
