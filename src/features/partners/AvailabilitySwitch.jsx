import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/api/errors'
import { cn } from '@/lib/utils'
import { partnerApi } from './api'
import usePartnerApproved from './usePartnerApproved'

const captions = {
  Active: 'Available for booking',
  PendingVerification: 'On · goes live once documents are verified',
  Inactive: 'Not available',
}

/**
 * The partner's on/off switch for taking bookings: Inactive ⇄ Active (the server keeps a vehicle with
 * unverified documents in PendingVerification). Calls `onChange(updatedVehicle)` after a successful change.
 */
export default function AvailabilitySwitch({ vehicle, onChange, className }) {
  const approved = usePartnerApproved()
  const [busy, setBusy] = useState(false)
  if (vehicle.status === 'Retired') return null

  const on = vehicle.status !== 'Inactive'
  const disabled = busy || (!on && !approved)

  const toggle = async () => {
    setBusy(true)
    try {
      const updated = await partnerApi.setVehicleStatus(vehicle.partnerVehicleId, on ? 'Inactive' : 'Active')
      onChange?.(updated)
      toast.success(on ? 'Vehicle switched off for bookings' : 'Vehicle switched on for bookings')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <label className={cn('flex items-center gap-2.5 text-sm', disabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        disabled={disabled}
        title={!on && !approved ? 'Your partner account must be approved first' : undefined}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 outline-none',
          'focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50',
          on ? 'bg-emerald-600' : 'bg-input',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-300',
            on ? 'translate-x-5.5' : 'translate-x-0.5',
            busy && 'animate-pulse',
          )}
        />
      </button>
      <span className={cn(on ? 'text-foreground' : 'text-muted-foreground')}>{captions[vehicle.status]}</span>
    </label>
  )
}
