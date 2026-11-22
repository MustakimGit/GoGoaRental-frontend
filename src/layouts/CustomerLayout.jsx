import { ArrowLeft, CalendarDays, Clock, Heart, MapPin, MessageCircle, Phone, Route, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { logout, selectAuthChecked, selectCurrentUser } from '@/features/auth/authSlice'
import { BRAND_NAME, CONTACT_PHONE, LOGO_URL, MIN_RENTAL_DAYS } from '@/lib/brand'
import { formatPhone, phoneHref, whatsappHref } from '@/lib/format'
import { homeByRole, navByRole } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function BrandMark({ className, size = 'md' }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <img
        src={LOGO_URL}
        alt=""
        className={cn('rounded-xl bg-white object-contain shadow-sm ring-1 ring-black/5', size === 'lg' ? 'size-14' : 'size-11')}
      />
      <span className="grid leading-none">
        <span className={cn('font-extrabold tracking-tight italic', size === 'lg' ? 'text-2xl' : 'text-xl')}>
          <span className="text-brand-blue">Go</span>
          <span className="text-brand-orange">Goa</span>
        </span>
        <span className="mt-0.5 text-[0.65rem] font-semibold tracking-[0.3em] text-brand-blue uppercase">Rentals</span>
      </span>
      <span className="sr-only">{BRAND_NAME}</span>
    </span>
  )
}

function RoleNav() {
  const user = useSelector(selectCurrentUser)
  const links = navByRole[user?.role] ?? []
  if (links.length === 0) return null
  return (
    <nav aria-label="Main" className="order-last flex w-full gap-1 overflow-x-auto pb-2 sm:order-none sm:w-auto sm:pb-0">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            cn(
              'rounded-full px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isActive && 'bg-primary/10 font-medium text-primary',
            )
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}

// Shown on the search page: back to the user's own landing page (admin dashboard, partner vehicles, or home).
function BackToDashboard() {
  const { pathname } = useLocation()
  const user = useSelector(selectCurrentUser)
  if (pathname !== '/search') return null
  const to = homeByRole[user?.role] ?? '/'
  const label = to === '/' ? 'Back to home' : 'Back to dashboard'
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={to} aria-label={label}>
        <ArrowLeft aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </Button>
  )
}

function AccountMenu() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const checked = useSelector(selectAuthChecked)

  if (!checked) return null

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Log in</Link>
        </Button>
        <Button size="sm" className="rounded-full px-4 shadow-md shadow-primary/20" asChild>
          <Link to="/register">Sign up</Link>
        </Button>
      </div>
    )
  }

  const onLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/account" className="max-w-40 truncate">
          {user.name}
        </Link>
      </Button>
      <Button variant="outline" size="sm" className="rounded-full" onClick={onLogout}>
        Log out
      </Button>
    </div>
  )
}

const notices = [
  { icon: CalendarDays, text: `Minimum rental: ${MIN_RENTAL_DAYS} days` },
  { icon: Route, text: 'Extra charges apply for far-off pickup or drop locations' },
  { icon: Clock, text: 'Rental days run 9 am to 9 am, Goa time' },
  { icon: MapPin, text: 'Pickup at Mopa & Dabolim airports' },
  { icon: ShieldCheck, text: 'Verified local partners only' },
]

function NoticeItems({ hidden = false }) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {notices.map(({ icon: Icon, text }) => (
        <span key={text} className="flex items-center gap-1.5">
          <Icon className="size-3.5 text-brand-sun" aria-hidden="true" /> {text}
        </span>
      ))}
      <a href={phoneHref(CONTACT_PHONE)} tabIndex={hidden ? -1 : undefined} className="flex items-center gap-1.5 underline-offset-2 hover:underline">
        <Phone className="size-3.5 text-brand-sun" aria-hidden="true" /> Call {formatPhone(CONTACT_PHONE)}
      </a>
    </div>
  )
}

// Scrolling ticker; pauses on hover and stays still for users who prefer reduced motion.
function NoticeBar() {
  return (
    <div className="group overflow-hidden bg-brand-blue py-1.5 text-xs font-medium whitespace-nowrap text-white">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        <NoticeItems />
        <span className="motion-reduce:hidden">
          <NoticeItems hidden />
        </span>
      </div>
    </div>
  )
}

const currentYear = new Date().getFullYear()

function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-[linear-gradient(180deg,transparent,color-mix(in_oklch,var(--brand-sea)_12%,transparent))]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div className="grid content-start gap-4">
          <Link to="/" className="w-fit">
            <BrandMark size="lg" />
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            Scooters, bikes and cars from verified Goan rental partners. One clear price per vehicle type, picked up where you land or
            delivered to your stay.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/#search" className="transition-colors hover:text-primary">
                Find a ride
              </Link>
            </li>
            <li>
              <Link to="/#fleet" className="transition-colors hover:text-primary">
                Our fleet
              </Link>
            </li>
            <li>
              <Link to="/#locations" className="transition-colors hover:text-primary">
                Pickup points
              </Link>
            </li>
            <li>
              <Link to="/#faq" className="transition-colors hover:text-primary">
                FAQs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Account</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/login" className="transition-colors hover:text-primary">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/register" className="transition-colors hover:text-primary">
                Create an account
              </Link>
            </li>
            <li>
              <Link to="/register?as=partner" className="transition-colors hover:text-primary">
                Become a rental partner
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Contact us</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>
              <a href={phoneHref(CONTACT_PHONE)} className="flex items-center gap-2 transition-colors hover:text-primary">
                <Phone className="size-4 text-brand-orange" aria-hidden="true" /> {formatPhone(CONTACT_PHONE)}
              </a>
            </li>
            <li>
              <a
                href={whatsappHref(CONTACT_PHONE)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <MessageCircle className="size-4 text-brand-palm" aria-hidden="true" /> Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} {BRAND_NAME}. All rental times are in Goa time (IST).</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3.5 fill-red-500 text-red-500" aria-label="love" /> in Goa
          </p>
        </div>
      </div>
    </footer>
  )
}

/** Scrolls to `#section` links (also across pages) and to the top on normal navigation. */
function useScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [pathname, hash])
}

export default function CustomerLayout() {
  const [scrolled, setScrolled] = useState(false)
  useScrollToHash()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <header
        className={cn(
          'sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-lg transition-[border-color,box-shadow,background-color] duration-300',
          scrolled && 'border-border bg-background/85 shadow-sm',
        )}
      >
        {/* Inside the sticky header so the notices stay visible while scrolling. */}
        <NoticeBar />
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 pt-2 sm:flex-nowrap sm:pt-0">
          <Link to="/" className="transition-transform duration-300 hover:scale-[1.03]">
            <BrandMark />
          </Link>
          <RoleNav />
          <div className="ml-auto flex items-center gap-3">
            <BackToDashboard />
            <a
              href={phoneHref(CONTACT_PHONE)}
              className="hidden items-center gap-1.5 rounded-full border border-brand-orange/40 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-brand-orange/10 lg:flex"
            >
              <Phone className="size-4 text-brand-orange" aria-hidden="true" />
              {formatPhone(CONTACT_PHONE)}
            </a>
            <AccountMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
