import { Bike, Car, CircleCheck, Handshake, RefreshCw, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { errorMessage } from '@/api/errors'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import useApiData from '@/hooks/useApiData'
import { formatDate, formatPhone, formatRegistration, phoneHref } from '@/lib/format'
import { formatGoaDateTime } from '@/lib/goaTime'
import { availabilityLabels, partnerStatusLabels, vehicleStatusLabels } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { adminApi } from './api'

function StatTile({ icon: Icon, label, value, note, accent }) {
  return (
    <Card className="gap-1 px-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <span className={cn('grid size-8 place-items-center rounded-lg', accent)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </Card>
  )
}

const matches = (partner, term) => {
  if (!term) return true
  const text = [
    partner.businessName,
    partner.ownerName,
    partner.email,
    partner.contactPhone,
    ...partner.vehicles.flatMap((v) => [v.registrationNumber, v.make, v.model, v.vehicleTypeName]),
  ]
    .join(' ')
    .toLowerCase()
  return text.includes(term) || text.replace(/\s/g, '').includes(term.replace(/\s/g, ''))
}

function PartnerCard({ partner, onlyAvailable }) {
  const vehicles = onlyAvailable ? partner.vehicles.filter((v) => v.availability === 'AvailableNow') : partner.vehicles
  const availableCount = partner.vehicles.filter((v) => v.availability === 'AvailableNow').length

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
        <div className="grid gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{partner.businessName}</h2>
            <StatusBadge value={partner.status} labels={partnerStatusLabels} />
          </div>
          <p className="text-sm text-muted-foreground">
            {partner.ownerName} · {partner.email} ·{' '}
            <a href={phoneHref(partner.contactPhone)} className="whitespace-nowrap hover:text-foreground hover:underline">
              {formatPhone(partner.contactPhone)}
            </a>
          </p>
          <p className="text-xs text-muted-foreground">Joined {formatDate(partner.createdAt)}</p>
        </div>
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{partner.vehicles.length}</span>{' '}
          <span className="text-muted-foreground">vehicle{partner.vehicles.length === 1 ? '' : 's'} ·</span>{' '}
          <span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">{availableCount}</span>{' '}
          <span className="text-muted-foreground">available now</span>
        </p>
      </div>
      {vehicles.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">{onlyAvailable ? 'No vehicle available right now.' : 'No vehicles registered yet.'}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Registration</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Based at</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4">Bookable now</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => {
              const Icon = /two/i.test(v.categoryName) ? Bike : Car
              return (
                <TableRow key={v.partnerVehicleId}>
                  <TableCell className="pl-4 font-mono font-medium whitespace-nowrap">{formatRegistration(v.registrationNumber)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span>
                        {v.make} {v.model}
                        <span className="block text-xs text-muted-foreground">{v.vehicleTypeName}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{v.pickupLocationName}</TableCell>
                  <TableCell>
                    <StatusBadge value={v.status} labels={vehicleStatusLabels} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <StatusBadge value={v.availability} labels={availabilityLabels} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useApiData(adminApi.dashboard)
  const [query, setQuery] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const term = query.trim().toLowerCase()
  const partners = (data?.partners ?? []).filter(
    (p) => matches(p, term) && (!onlyAvailable || p.vehicles.some((v) => v.availability === 'AvailableNow')),
  )

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <PageHeader
        title="Dashboard"
        description={data ? `Every partner and their vehicles, as of ${formatGoaDateTime(data.generatedAtUtc)}.` : 'Every partner and their vehicles.'}
        actions={
          <Button variant="outline" onClick={reload} disabled={loading}>
            <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
          </Button>
        }
      />

      {error ? (
        <p className="text-sm text-destructive">{errorMessage(error)}</p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile icon={Users} label="Customers" value={data.totals.customers} accent="bg-brand-sea/15 text-brand-blue" />
            <StatTile
              icon={Handshake}
              label="Partners"
              value={data.totals.partners}
              note={data.totals.partnersAwaitingApproval ? `${data.totals.partnersAwaitingApproval} awaiting approval` : 'None awaiting approval'}
              accent="bg-brand-orange/15 text-brand-orange"
            />
            <StatTile icon={Car} label="Vehicles" value={data.totals.vehicles} note="Excluding retired" accent="bg-brand-blue/10 text-brand-blue" />
            <StatTile
              icon={CircleCheck}
              label="Available now"
              value={data.totals.vehiclesAvailableNow}
              note="Live, verified and free this minute"
              accent="bg-brand-palm/15 text-brand-palm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-60 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search partner, owner, email, phone or registration…"
                aria-label="Search partners and vehicles"
                className="pl-8"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="accent-primary" />
              Only vehicles available now
            </label>
          </div>

          {partners.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {data.partners.length === 0 ? 'No partners have signed up yet.' : 'No partners match these filters.'}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {partners.map((p) => (
                <PartnerCard key={p.rentalPartnerId} partner={p} onlyAvailable={onlyAvailable} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
