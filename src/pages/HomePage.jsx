import {
  ArrowRight,
  BadgeIndianRupee,
  Bike,
  CalendarCheck,
  Car,
  ChevronDown,
  Clock,
  Handshake,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  TrainFront,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { catalogApi } from '@/api/catalog'
import Reveal from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import SearchForm from '@/features/search/SearchForm'
import { readSearchParams } from '@/features/search/searchParams'
import useApiData from '@/hooks/useApiData'
import { BRAND_NAME, CONTACT_PHONE, LOGO_URL, STARTING_PRICE_PER_DAY } from '@/lib/brand'
import { formatPhone, phoneHref, whatsappHref } from '@/lib/format'
import { rupees } from '@/lib/goaTime'
import { cn } from '@/lib/utils'

const isTwoWheeler = (categoryName) => /two/i.test(categoryName ?? '')

function SectionHeading({ eyebrow, title, children, className }) {
  return (
    <Reveal className={cn('mx-auto max-w-2xl text-center', className)}>
      <p className="text-xs font-semibold tracking-[0.25em] text-brand-orange uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-muted-foreground text-pretty">{children}</p>}
    </Reveal>
  )
}

function Hero() {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(160deg,color-mix(in_oklch,var(--brand-sea)_22%,var(--background))_0%,var(--background)_55%,color-mix(in_oklch,var(--brand-sun)_18%,var(--background))_100%)]">
      {/* Decorative sun and sea glow, echoing the logo. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full bg-brand-sun/40 blur-3xl animate-sun-pulse" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 size-[30rem] rounded-full bg-brand-sea/25 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-28 md:grid-cols-[1.15fr_1fr] md:pt-20 md:pb-36">
        <div>
          <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-orange/30 bg-card/70 px-3 py-1 text-xs font-medium text-accent-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-brand-orange" aria-hidden="true" /> Scooters · Bikes · Cars across Goa
          </p>
          <h1 className="mt-5 animate-fade-up text-4xl leading-[1.05] font-extrabold tracking-tight text-balance [animation-delay:80ms] sm:text-5xl lg:text-6xl">
            Ride <span className="text-brand-gradient">Goa</span> your way, from the airport to the beach.
          </h1>
          <p className="mt-5 max-w-xl animate-fade-up text-lg text-muted-foreground text-pretty [animation-delay:160ms]">
            One fixed price per vehicle type. Pick your dates and pickup point and we find you a well-kept ride from a verified local
            partner.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
            <Button size="lg" className="h-11 rounded-full px-6 text-base shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5" asChild>
              <a href="#search">
                <Search /> Find a ride
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-11 rounded-full bg-card/70 px-6 text-base backdrop-blur" asChild>
              <a href={phoneHref(CONTACT_PHONE)}>
                <Phone className="text-brand-orange" /> {formatPhone(CONTACT_PHONE)}
              </a>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-11 rounded-full px-4 text-base text-brand-palm hover:bg-brand-palm/10 hover:text-brand-palm"
              asChild
            >
              <a href={whatsappHref(CONTACT_PHONE)} target="_blank" rel="noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-md animate-fade-up grid-cols-3 gap-4 [animation-delay:320ms]">
            {[
              [rupees(STARTING_PRICE_PER_DAY), 'Per day, starting from'],
              ['2', 'Airports covered'],
              ['9 am', 'Day starts, Goa time'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-bold text-brand-blue">{value}</dd>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto hidden w-full max-w-sm animate-fade-up [animation-delay:200ms] md:block">
          <div aria-hidden="true" className="absolute inset-6 rounded-full border-2 border-dashed border-brand-orange/30 animate-spin-slow" />
          <img
            src={LOGO_URL}
            alt={`${BRAND_NAME} logo`}
            className="relative aspect-square w-full animate-float rounded-[2.5rem] bg-white object-contain p-4 shadow-2xl shadow-brand-blue/20 ring-1 ring-black/5"
          />
          <div className="absolute -bottom-4 -left-6 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm shadow-xl ring-1 ring-foreground/5">
            <span className="grid size-8 place-items-center rounded-full bg-brand-palm/15 text-brand-palm">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-semibold">Documents checked</span>
              <span className="text-xs text-muted-foreground">RC, insurance, PUC &amp; permit</span>
            </span>
          </div>
          <div className="absolute -top-3 -right-4 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm shadow-xl ring-1 ring-foreground/5">
            <Sun className="size-5 text-brand-orange" aria-hidden="true" />
            <span className="font-semibold">Ready for the coast</span>
          </div>
        </div>
      </div>

      {/* Wave into the page background. */}
      <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute bottom-0 h-16 w-full fill-background">
        <path d="M0 40c120 22 240 33 360 33S600 62 720 46s240-38 360-38 240 16 360 32v40H0z" />
      </svg>
    </div>
  )
}

function FleetCard({ type, delay }) {
  const two = isTwoWheeler(type.categoryName)
  const Icon = two ? Bike : Car
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/10 hover:ring-brand-blue/30">
        <div
          className={cn(
            'relative grid aspect-[16/10] place-items-center overflow-hidden',
            two
              ? 'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--brand-sun)_35%,var(--card)),color-mix(in_oklch,var(--brand-orange)_25%,var(--card)))]'
              : 'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--brand-sea)_35%,var(--card)),color-mix(in_oklch,var(--brand-blue)_22%,var(--card)))]',
          )}
        >
          {type.imageUrl ? (
            <img src={type.imageUrl} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <Icon className="size-16 text-foreground/70 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" strokeWidth={1.4} aria-hidden="true" />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-card/85 px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase backdrop-blur">
            {type.categoryName}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-lg font-semibold">{type.name}</h3>
          {type.description && <p className="text-sm text-muted-foreground">{type.description}</p>}
          <div className="mt-auto flex items-center justify-between pt-3">
            {type.seatingCapacity ? (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-4" aria-hidden="true" /> {type.seatingCapacity} seats
              </span>
            ) : (
              <span />
            )}
            <a href="#search" className="flex items-center gap-1 text-sm font-medium text-primary">
              Check prices <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

function Fleet() {
  const types = useApiData(catalogApi.vehicleTypes)
  const [filter, setFilter] = useState('all')
  const all = types.data ?? []
  const shown = all.filter((t) => filter === 'all' || (filter === 'two') === isTwoWheeler(t.categoryName))

  return (
    <section id="fleet" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20">
      <SectionHeading eyebrow="Our fleet" title="Pick the ride that fits your trip">
        Zip between beaches on a scooter, cruise the coast on a 350cc, or bring the whole family in an SUV.
      </SectionHeading>
      <Reveal className="mt-4 flex justify-center">
        <p className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
          Rentals from <span className="font-bold">{rupees(STARTING_PRICE_PER_DAY)}</span> per day
        </p>
      </Reveal>

      <Reveal className="mt-8 flex justify-center">
        <div role="group" aria-label="Filter vehicles" className="inline-flex rounded-full bg-muted p-1">
          {[
            ['all', 'All'],
            ['two', 'Two-wheelers'],
            ['four', 'Four-wheelers'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all',
                filter === value && 'bg-card text-foreground shadow-sm',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      {types.loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : types.error || all.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">The fleet will appear here once vehicle types are set up.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t, i) => (
            <FleetCard key={t.vehicleTypeId} type={t} delay={(i % 3) * 90} />
          ))}
        </div>
      )}
    </section>
  )
}

const features = [
  [ShieldCheck, 'Verified partners', 'Every partner and vehicle is reviewed. RC, insurance, PUC and rental permit are checked before a vehicle can be booked.'],
  [BadgeIndianRupee, 'One clear price', 'A fixed daily price per vehicle type. Delivery, taxes and the refundable deposit are shown before you book.'],
  [Plane, 'Airport pickups', 'Collect your ride at Mopa or Dabolim airport, major railway stations or popular beach towns.'],
  [Truck, 'Delivery to your stay', 'Prefer not to travel to a pickup point? Choose delivery and the vehicle comes to you.'],
  [Clock, 'Simple rental days', 'A rental day runs 9 am to 9 am Goa time, so you always know how many days you pay for.'],
  [Wallet, 'Refundable deposit', 'Your deposit is returned at the end of the rental, as long as the vehicle comes back in good shape.'],
]

function Features() {
  return (
    <section className="relative overflow-hidden bg-brand-blue py-20 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-brand-orange/25 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.25em] text-brand-sun uppercase">Why {BRAND_NAME}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">Stress-free rentals, made in Goa</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, text], i) => (
            <Reveal key={title} delay={(i % 3) * 90}>
              <div className="group h-full rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10 backdrop-blur transition-colors duration-300 hover:bg-white/[0.12]">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-orange text-black transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-white/75">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  [Search, 'Search', 'Choose your pickup point, dates and times. Prices for every vehicle type show up instantly.'],
  [CalendarCheck, 'Book', 'Pick the vehicle type you like. We match you with an available vehicle from a verified partner.'],
  [Bike, 'Ride', 'Collect it or get it delivered, show your licence, and the island is yours.'],
]

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <SectionHeading eyebrow="How it works" title="On the road in three steps" />
      <div className="relative mt-12">
        <div aria-hidden="true" className="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-brand-orange/40 md:block" />
        <ol className="relative grid gap-8 md:grid-cols-3">
        {steps.map(([Icon, title, text], i) => (
          <Reveal as="li" key={title} delay={i * 120} className="relative text-center">
            <span className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-card text-brand-blue shadow-lg ring-1 ring-foreground/10">
              <Icon className="size-6" aria-hidden="true" />
              <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-brand-orange text-xs font-bold text-black">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{text}</p>
          </Reveal>
        ))}
        </ol>
      </div>
    </section>
  )
}

function locationIcon(name) {
  if (/airport/i.test(name)) return Plane
  if (/railway|station/i.test(name)) return TrainFront
  return MapPin
}

function Locations() {
  const locations = useApiData(catalogApi.pickupLocations)
  const list = locations.data ?? []
  if (!locations.loading && list.length === 0) return null

  return (
    <section id="locations" className="scroll-mt-28 bg-muted/60 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Pickup points" title="From the airport to the beach shacks">
          Land at Mopa or Dabolim, step off the train, or start right where you are staying.
        </SectionHeading>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((l, i) => {
            const Icon = locationIcon(l.name)
            const airport = Icon === Plane
            return (
              <Reveal key={l.pickupLocationId} delay={(i % 4) * 70}>
                <Link
                  to={`/?location=${l.pickupLocationId}#search`}
                  className={cn(
                    'group flex h-full items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-blue/30',
                    airport && 'ring-brand-orange/40',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                      airport ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-blue/10 text-brand-blue',
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="grid gap-0.5">
                    <span className="font-medium">{l.name}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{l.address}</span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const faqs = [
  [
    'How is a rental day counted?',
    'A rental day runs from 9 am to 9 am, Goa time. Returning after 9 am counts as another day, so picking up at 9 am and returning by 9 am the next morning is one day.',
  ],
  [
    'What do I need to rent a vehicle?',
    'Bring a valid driving licence for the type of vehicle you rent and a government photo ID when you collect it.',
  ],
  [
    'Is there a security deposit?',
    'Most vehicle types have a refundable deposit, shown in the price breakdown before you book. It is returned when the vehicle comes back in good condition.',
  ],
  [
    'Can the vehicle be delivered to my hotel?',
    'Yes. Choose "Deliver to me" when searching. Any delivery fee for that area is shown in the price breakdown.',
  ],
  [
    'Who owns the vehicles?',
    `Vehicles belong to local Goan rental partners. ${BRAND_NAME} reviews every partner and vehicle document before the vehicle can be booked.`,
  ],
]

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-20">
      <SectionHeading eyebrow="FAQs" title="Good to know before you ride" />
      <div className="mt-10 grid gap-3">
        {faqs.map(([q, a], i) => (
          <Reveal key={q} delay={i * 60}>
            <details className="group rounded-2xl bg-card ring-1 ring-foreground/10 transition-shadow open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="-mt-1 px-5 pb-5 text-sm text-muted-foreground">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function PartnerCta() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,var(--brand-orange),color-mix(in_oklch,var(--brand-sun)_80%,var(--brand-orange)))] p-8 text-black sm:p-12">
          <Handshake aria-hidden="true" className="absolute -right-6 -bottom-8 size-48 text-black/10 transition-transform duration-700" strokeWidth={1.2} />
          <div className="relative max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Own scooters, bikes or cars in Goa?</h2>
            <p className="mt-2 text-black/75">
              Join as a rental partner. Add your vehicles, keep their calendar up to date, and get bookings from travellers without the
              marketing hassle.
            </p>
            <Button size="lg" className="mt-6 h-11 rounded-full bg-brand-blue px-6 text-base text-white hover:bg-brand-blue/90" asChild>
              <Link to="/register?as=partner">
                Become a partner <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default function HomePage() {
  const [params] = useSearchParams()
  return (
    <>
      <Hero />
      <section id="search" className="relative z-10 mx-auto -mt-24 max-w-6xl scroll-mt-32 px-4 md:-mt-28">
        <div className="animate-fade-up [animation-delay:400ms]">
          <SearchForm key={params.toString()} initial={readSearchParams(params)} className="rounded-3xl p-5 shadow-2xl shadow-brand-blue/15 sm:p-6" />
        </div>
      </section>
      <Fleet />
      <Features />
      <HowItWorks />
      <Locations />
      <Faq />
      <PartnerCta />
    </>
  )
}
