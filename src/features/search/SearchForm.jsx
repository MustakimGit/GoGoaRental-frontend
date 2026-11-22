import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { catalogApi } from '@/api/catalog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useApiData from '@/hooks/useApiData'
import { MIN_RENTAL_DAYS } from '@/lib/brand'
import { addDays, goaToday } from '@/lib/goaTime'
import { cn } from '@/lib/utils'
import PickupLocationSelect from './PickupLocationSelect'

function Field({ label, htmlFor, className, children }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

export default function SearchForm({ initial, compact = false, className }) {
  const navigate = useNavigate()
  const locations = useApiData(catalogApi.pickupLocations)
  const [form, setForm] = useState(initial)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const today = goaToday()

  const onPickupDate = (e) => {
    const pickupDate = e.target.value
    // Keep return after pickup: if needed, move it out to the minimum rental length.
    setForm((f) => ({ ...f, pickupDate, returnDate: f.returnDate <= pickupDate ? addDays(pickupDate, MIN_RENTAL_DAYS) : f.returnDate }))
  }

  const submit = (e) => {
    e.preventDefault()
    navigate(`/search?${new URLSearchParams(form)}`)
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        'grid gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_auto]',
        compact && 'shadow-none',
        className,
      )}
    >
      <Field label="Pickup point" htmlFor="s-location" className="sm:col-span-2 lg:col-span-1">
        <PickupLocationSelect
          id="s-location"
          locations={locations.data ?? []}
          value={form.location}
          onChange={(location) => setForm((f) => ({ ...f, location }))}
          required
        />
        <div className="flex gap-4 text-sm">
          {[
            ['SelfPickup', 'I’ll collect it'],
            ['Delivery', 'Deliver to me'],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-1.5">
              <input type="radio" name="mode" value={value} checked={form.mode === value} onChange={set('mode')} className="accent-primary" />
              {label}
            </label>
          ))}
        </div>
        <Label htmlFor="s-drop" className="mt-1">
          Drop point
        </Label>
        <PickupLocationSelect
          id="s-drop"
          name="drop"
          locations={locations.data ?? []}
          value={form.drop}
          onChange={(drop) => setForm((f) => ({ ...f, drop }))}
          noneLabel="Same as pickup point"
        />
      </Field>
      <Field label="Pickup" htmlFor="s-pickup-date">
        <div className="flex gap-2">
          <Input id="s-pickup-date" type="date" min={today} value={form.pickupDate} onChange={onPickupDate} required className="min-w-0 flex-1" />
          <Input type="time" step="1800" aria-label="Pickup time" value={form.pickupTime} onChange={set('pickupTime')} required className="w-28 shrink-0" />
        </div>
      </Field>
      <Field label="Return" htmlFor="s-return-date">
        <div className="flex gap-2">
          <Input id="s-return-date" type="date" min={form.pickupDate} value={form.returnDate} onChange={set('returnDate')} required className="min-w-0 flex-1" />
          <Input type="time" step="1800" aria-label="Return time" value={form.returnTime} onChange={set('returnTime')} required className="w-28 shrink-0" />
        </div>
      </Field>
      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Button type="submit" className="w-full bg-brand-orange text-black shadow-md shadow-brand-orange/30 hover:bg-brand-orange/85 lg:h-8">
          <Search /> Search
        </Button>
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
        Minimum rental is {MIN_RENTAL_DAYS} days. Prices are per rental day, 9 am to 9 am (Goa time). Returning after 9 am counts as
        another day.
      </p>
    </form>
  )
}
