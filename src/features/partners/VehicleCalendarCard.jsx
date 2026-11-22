import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/api/errors'
import NativeSelect from '@/components/NativeSelect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import useApiData from '@/hooks/useApiData'
import { addDays, formatGoaDateTime, goaToday, RENTAL_DAY_START, toGoaIso } from '@/lib/goaTime'
import { partnerApi } from './api'

const blockLabels = {
  Reservation: 'Customer booking',
  Maintenance: 'Maintenance',
  PartnerUnavailable: 'Not available',
}

function AddBlockDialog({ vehicleId, open, onOpenChange, onAdded }) {
  const blank = () => {
    const today = goaToday()
    return { blockType: 'Maintenance', startDate: today, startTime: RENTAL_DAY_START, endDate: addDays(today, 1), endTime: RENTAL_DAY_START, notes: '' }
  }
  const [form, setForm] = useState(blank)
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const block = await partnerApi.addCalendarBlock(vehicleId, {
        blockType: form.blockType,
        startAt: toGoaIso(form.startDate, form.startTime),
        endAt: toGoaIso(form.endDate, form.endTime),
        notes: form.notes || null,
      })
      toast.success('Dates blocked')
      onAdded(block)
      setForm(blank())
      onOpenChange(false)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Block dates</DialogTitle>
            <DialogDescription>No bookings will be assigned to this vehicle during this time. Times are Goa time.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="b-type">Reason</Label>
            <NativeSelect id="b-type" value={form.blockType} onChange={set('blockType')}>
              <option value="Maintenance">Maintenance or repair</option>
              <option value="PartnerUnavailable">Not available (own use, etc.)</option>
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="b-start">From</Label>
            <div className="flex gap-2">
              <Input id="b-start" type="date" value={form.startDate} onChange={set('startDate')} required />
              <Input type="time" aria-label="From time" value={form.startTime} onChange={set('startTime')} required className="w-28" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="b-end">Until</Label>
            <div className="flex gap-2">
              <Input id="b-end" type="date" min={form.startDate} value={form.endDate} onChange={set('endDate')} required />
              <Input type="time" aria-label="Until time" value={form.endTime} onChange={set('endTime')} required className="w-28" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="b-notes">Note (optional)</Label>
            <Textarea id="b-notes" maxLength={500} value={form.notes} onChange={set('notes')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Block dates
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function VehicleCalendarCard({ vehicleId, disabled }) {
  const [adding, setAdding] = useState(false)
  const { data: blocks, error, setData } = useApiData(() => partnerApi.listCalendar(vehicleId), [vehicleId])

  const remove = async (block) => {
    try {
      await partnerApi.removeCalendarBlock(block.calendarBlockId)
      setData((rows) => rows.filter((b) => b.calendarBlockId !== block.calendarBlockId))
      toast.success('Block removed')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-2">
        <div className="grid gap-1">
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Upcoming bookings and dates you’ve blocked off.</CardDescription>
        </div>
        {!disabled && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus /> Block dates
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{errorMessage(error)}</p>
        ) : !blocks ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled. The vehicle is free whenever it’s live.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {blocks.map((b) => (
              <li key={b.calendarBlockId} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <div className="grid gap-0.5">
                  <span className="font-medium">
                    {blockLabels[b.blockType]}
                    {b.bookingNumber && <span className="font-normal text-muted-foreground"> · {b.bookingNumber}</span>}
                  </span>
                  <span className="text-muted-foreground">
                    {formatGoaDateTime(b.startAt)} → {formatGoaDateTime(b.endAt)}
                  </span>
                  {b.notes && <span className="text-xs text-muted-foreground">{b.notes}</span>}
                </div>
                {b.blockType !== 'Reservation' && (
                  <Button size="xs" variant="ghost" onClick={() => remove(b)}>
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <AddBlockDialog
        vehicleId={vehicleId}
        open={adding}
        onOpenChange={setAdding}
        onAdded={(block) => setData((rows) => [...rows, block].sort((a, b) => a.startAt.localeCompare(b.startAt)))}
      />
    </Card>
  )
}
