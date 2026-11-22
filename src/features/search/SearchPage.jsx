import { MessageCircle, Users } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router'
import { catalogApi } from '@/api/catalog'
import apiClient from '@/api/client'
import { errorMessage } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { selectCurrentUser } from '@/features/auth/authSlice'
import useApiData from '@/hooks/useApiData'
import { MIN_RENTAL_DAYS } from '@/lib/brand'
import { formatGoaDateTime, rupees, toGoaIso } from '@/lib/goaTime'
import { bookingWhatsappHref } from './bookingMessage'
import SearchForm from './SearchForm'
import { readSearchParams } from './searchParams'

function QuoteCard({ quote, trip, user }) {
  const soldOut = quote.availableVehicles === 0
  const tooShort = quote.rentalDays < MIN_RENTAL_DAYS
  const sameRate = quote.days.every((d) => d.price === quote.days[0].price)
  return (
    <Card
      className={
        soldOut ? 'opacity-70' : 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/10 hover:ring-brand-blue/30'
      }
    >
      {quote.imageUrl && <img src={quote.imageUrl} alt="" className="-mt-4 aspect-video w-full rounded-t-xl object-cover" />}
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{quote.categoryName}</p>
        <CardTitle className="text-lg">{quote.vehicleTypeName}</CardTitle>
        {quote.description && <p className="text-sm text-muted-foreground">{quote.description}</p>}
        {quote.seatingCapacity && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="size-4" aria-hidden="true" /> {quote.seatingCapacity} seats
          </p>
        )}
      </CardHeader>
      <CardContent>
        <dl className="grid gap-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {sameRate ? `${rupees(quote.days[0].price)} × ${quote.rentalDays} day${quote.rentalDays > 1 ? 's' : ''}` : `${quote.rentalDays} days (seasonal rates)`}
            </dt>
            <dd className="tabular-nums">{rupees(quote.rentalPrice)}</dd>
          </div>
          {quote.deliveryFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">{rupees(quote.deliveryFee)}</dd>
            </div>
          )}
          {quote.taxAmount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Taxes</dt>
              <dd className="tabular-nums">{rupees(quote.taxAmount)}</dd>
            </div>
          )}
          {quote.depositAmount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Refundable deposit</dt>
              <dd className="tabular-nums">{rupees(quote.depositAmount)}</dd>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t pt-2 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{rupees(quote.totalAmount)}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between gap-2">
        <span className={soldOut ? 'text-sm text-destructive' : 'text-sm text-emerald-700 dark:text-emerald-400'}>
          {soldOut ? 'Sold out for these dates' : `${quote.availableVehicles} available`}
        </span>
        {soldOut || tooShort ? (
          <Button disabled title={tooShort ? `Minimum rental is ${MIN_RENTAL_DAYS} days` : undefined}>
            Book
          </Button>
        ) : (
          <Button asChild className="bg-brand-palm text-white hover:bg-brand-palm/85">
            <a href={bookingWhatsappHref(quote, trip, user)} target="_blank" rel="noreferrer">
              <MessageCircle /> Book on WhatsApp
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default function SearchPage() {
  const [params] = useSearchParams()
  const criteria = readSearchParams(params)
  const ready = !!criteria.location
  const user = useSelector(selectCurrentUser)
  const locations = useApiData(catalogApi.pickupLocations)
  const dropName = criteria.drop
    ? (locations.data ?? []).find((l) => String(l.pickupLocationId) === criteria.drop)?.name
    : ''
  const trip = { mode: criteria.mode, dropName }

  const { data: quotes, loading, error } = useApiData(async () => {
    if (!ready) return []
    const { data } = await apiClient.get('/search', {
      params: {
        pickupLocationId: criteria.location,
        pickupMode: criteria.mode,
        pickupAt: toGoaIso(criteria.pickupDate, criteria.pickupTime),
        returnAt: toGoaIso(criteria.returnDate, criteria.returnTime),
      },
    })
    return data
  }, [params.toString()])

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <SearchForm key={params.toString()} initial={criteria} compact />

      {!ready ? (
        <p className="text-sm text-muted-foreground">Choose a pickup point to see prices.</p>
      ) : error ? (
        <p className="text-sm text-destructive">{errorMessage(error)}</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Finding vehicles…</p>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No vehicles are priced for these dates yet. Try different dates.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {quotes[0].pickupLocationName}
            {dropName && dropName !== quotes[0].pickupLocationName && ` → drop at ${dropName}`} · {formatGoaDateTime(quotes[0].pickupAtUtc)} →{' '}
            {formatGoaDateTime(quotes[0].returnAtUtc)} · {quotes[0].rentalDays} rental day{quotes[0].rentalDays > 1 ? 's' : ''}
          </p>
          {quotes[0].rentalDays < MIN_RENTAL_DAYS && (
            <p className="rounded-lg border border-brand-orange/40 bg-brand-orange/10 px-3 py-2 text-sm">
              Minimum rental is {MIN_RENTAL_DAYS} days. Please choose a later return date to book.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((q) => (
              <QuoteCard key={q.vehicleTypeId} quote={q} trip={trip} user={user} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
