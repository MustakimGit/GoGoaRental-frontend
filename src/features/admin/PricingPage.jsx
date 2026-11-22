import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { applyFieldErrors, errorMessage } from '@/api/errors'
import NativeSelect from '@/components/NativeSelect'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import FormField from '@/features/auth/FormField'
import useApiData from '@/hooks/useApiData'
import { formatDay, goaToday, rupees } from '@/lib/goaTime'
import { adminApi } from './api'

const schema = z
  .object({
    vehicleTypeId: z.coerce.number().int().positive('Choose a vehicle type'),
    dailyPrice: z.coerce.number().positive('Enter a price above zero'),
    depositAmount: z.coerce.number().min(0, 'Can’t be negative'),
    taxPercent: z.coerce.number().min(0).max(100),
    firstDay: z.string().min(1, 'Choose the first day'),
    lastDay: z.string().optional(),
  })
  .refine((v) => !v.lastDay || v.lastDay >= v.firstDay, { path: ['lastDay'], message: 'Must be on or after the first day' })

// Where a rate sits relative to today (rental days are named by their start date).
function rateState(price, today) {
  if (!price.isActive) return 'Withdrawn'
  if (price.lastDay && price.lastDay < today) return 'Ended'
  if (price.firstDay > today) return 'Upcoming'
  return 'Current'
}

const stateLabels = { Current: 'Current', Upcoming: 'Upcoming', Ended: 'Ended', Withdrawn: 'Withdrawn' }
const stateTone = { Current: 'Active', Upcoming: 'Pending', Ended: 'Inactive', Withdrawn: 'Inactive' } // reuse badge colours

function AddPriceDialog({ open, types, defaultTypeId, onOpenChange, onSaved }) {
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(schema),
    values: { vehicleTypeId: defaultTypeId ?? '', dailyPrice: '', depositAmount: 0, taxPercent: 0, firstDay: goaToday(), lastDay: '' },
  })
  const { errors, isSubmitting } = formState

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adminApi.createPrice({ ...values, lastDay: values.lastDay || null })
      toast.success('Price saved')
      onSaved()
      onOpenChange(false)
    } catch (error) {
      applyFieldErrors(error, setError)
      toast.error(errorMessage(error))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Set a daily price</DialogTitle>
            <DialogDescription>
              Applies to each rental day (9 am to 9 am) from the first day. A price with no last day replaces the current one from
              that date. A price with a last day, such as a peak season, applies only to those days, then the earlier price resumes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="p-type">Vehicle type</Label>
            <NativeSelect id="p-type" aria-invalid={errors.vehicleTypeId ? true : undefined} {...register('vehicleTypeId')}>
              <option value="">Choose…</option>
              {types.map((t) => (
                <option key={t.vehicleTypeId} value={t.vehicleTypeId}>
                  {t.categoryName}: {t.name}
                </option>
              ))}
            </NativeSelect>
            {errors.vehicleTypeId && <p className="text-sm text-destructive">{errors.vehicleTypeId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="p-price" label="Price per day (₹)" type="number" min="1" step="1" error={errors.dailyPrice?.message} {...register('dailyPrice')} />
            <FormField id="p-deposit" label="Deposit (₹)" type="number" min="0" step="1" error={errors.depositAmount?.message} {...register('depositAmount')} />
          </div>
          <FormField
            id="p-tax"
            label="Tax (%)"
            type="number"
            min="0"
            max="100"
            step="0.01"
            hint="Leave at 0 until the GST treatment is decided."
            error={errors.taxPercent?.message}
            {...register('taxPercent')}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField id="p-first" label="First day" type="date" error={errors.firstDay?.message} {...register('firstDay')} />
            <FormField id="p-last" label="Last day (optional)" type="date" error={errors.lastDay?.message} {...register('lastDay')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save price
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function PricingPage() {
  const [adding, setAdding] = useState(null) // null = closed, otherwise { typeId }
  const types = useApiData(adminApi.listVehicleTypes)
  const prices = useApiData(adminApi.listPrices)
  const [today] = useState(goaToday)

  const withdraw = async (price) => {
    if (!window.confirm(`Withdraw the ${rupees(price.dailyPrice)}/day price for ${price.vehicleTypeName}? Existing bookings keep their price.`)) return
    try {
      await adminApi.withdrawPrice(price.pricingId)
      toast.success('Price withdrawn')
      prices.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const error = types.error ?? prices.error
  const byType = {}
  for (const p of prices.data ?? []) (byType[p.vehicleTypeId] ??= []).push(p)

  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10">
      <PageHeader
        title="Pricing"
        description="Daily prices customers pay per vehicle type. Bookings keep the price they were quoted."
        actions={
          <Button onClick={() => setAdding({})}>
            <Plus /> Set a price
          </Button>
        }
      />

      {error ? (
        <p className="text-sm text-destructive">{errorMessage(error)}</p>
      ) : !types.data || !prices.data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        types.data.map((type) => {
          const rows = byType[type.vehicleTypeId] ?? []
          const current = rows.find((p) => rateState(p, today) === 'Current')
          return (
            <Card key={type.vehicleTypeId}>
              <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle>{type.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {type.categoryName}
                    {type.status === 'Inactive' && ' · hidden from customers'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {current ? (
                    <span className="text-lg font-semibold tabular-nums">
                      {rupees(current.dailyPrice)}
                      <span className="text-sm font-normal text-muted-foreground">/day</span>
                    </span>
                  ) : (
                    <span className="text-sm text-destructive">No price today: not bookable</span>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setAdding({ typeId: type.vehicleTypeId })}>
                    Change
                  </Button>
                </div>
              </CardHeader>
              {rows.length > 0 && (
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Days</TableHead>
                        <TableHead className="text-right">Per day</TableHead>
                        <TableHead className="text-right">Deposit</TableHead>
                        <TableHead className="text-right">Tax</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-0" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((p) => {
                        const state = rateState(p, today)
                        return (
                          <TableRow key={p.pricingId} className={state === 'Withdrawn' || state === 'Ended' ? 'text-muted-foreground' : undefined}>
                            <TableCell className="whitespace-nowrap">
                              {formatDay(p.firstDay)} → {p.lastDay ? formatDay(p.lastDay) : 'onwards'}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{rupees(p.dailyPrice)}</TableCell>
                            <TableCell className="text-right tabular-nums">{rupees(p.depositAmount)}</TableCell>
                            <TableCell className="text-right tabular-nums">{p.taxPercent}%</TableCell>
                            <TableCell>
                              <StatusBadge value={stateTone[state]} labels={{ [stateTone[state]]: stateLabels[state] }} />
                            </TableCell>
                            <TableCell>
                              {p.isActive && state !== 'Ended' && (
                                <Button size="xs" variant="ghost" onClick={() => withdraw(p)}>
                                  Withdraw
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          )
        })
      )}

      <AddPriceDialog
        open={!!adding}
        types={types.data ?? []}
        defaultTypeId={adding?.typeId}
        onOpenChange={(open) => !open && setAdding(null)}
        onSaved={prices.reload}
      />
    </section>
  )
}
