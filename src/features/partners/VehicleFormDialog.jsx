import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { catalogApi } from '@/api/catalog'
import { applyFieldErrors, errorMessage } from '@/api/errors'
import NativeSelect from '@/components/NativeSelect'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import FormField from '@/features/auth/FormField'
import useApiData from '@/hooks/useApiData'
import { partnerApi } from './api'

const thisYear = new Date().getFullYear()

const schema = z.object({
  vehicleId: z.coerce.number().int().positive('Choose the vehicle model'),
  registrationNumber: z
    .string()
    .trim()
    .min(1, 'Enter the registration number')
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .refine((v) => /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/.test(v) || /^\d{2}BH\d{4}[A-Z]{1,2}$/.test(v), 'e.g. GA 07 AB 1234'),
  manufacturingYear: z.coerce.number().int().min(1990).max(thisYear + 1, `Up to ${thisYear + 1}`),
  pickupLocationId: z.coerce.number().int().positive('Choose where the vehicle is based'),
  deliveryRadiusKm: z.coerce.number().min(0).max(100, 'Up to 100 km'),
})

function SelectField({ id, label, error, hint, children, ...props }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect id={id} aria-invalid={error ? true : undefined} {...props}>
        {children}
      </NativeSelect>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        hint && <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

/** Add (vehicle = {}) or edit (vehicle with id) a partner vehicle. Closed when vehicle is null. */
export default function VehicleFormDialog({ vehicle, onOpenChange, onSaved }) {
  const isEdit = !!vehicle?.partnerVehicleId
  const models = useApiData(catalogApi.vehicleModels)
  const locations = useApiData(catalogApi.pickupLocations)

  // Group the catalog by vehicle type (SUV, Hatchback, Non Gear, ...) for the dropdown.
  const modelGroups = Object.entries(
    (models.data ?? []).reduce((groups, m) => {
      const key = `${m.categoryName}: ${m.vehicleTypeName}`
      ;(groups[key] ??= []).push(m)
      return groups
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b))

  const { register, handleSubmit, setError, formState, control } = useForm({
    resolver: zodResolver(schema),
    values: {
      vehicleId: vehicle?.vehicleId ?? '',
      registrationNumber: vehicle?.registrationNumber ?? '',
      manufacturingYear: vehicle?.manufacturingYear ?? '',
      pickupLocationId: vehicle?.pickupLocationId ?? '',
      deliveryRadiusKm: vehicle?.deliveryRadiusKm ?? 0,
    },
  })
  const { errors, isSubmitting } = formState
  const lockRegistration = isEdit && vehicle.documents.length > 0
  const chosenId = useWatch({ control, name: 'vehicleId' })
  const chosen = (models.data ?? []).find((m) => String(m.vehicleId) === String(chosenId))

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = isEdit ? await partnerApi.updateVehicle(vehicle.partnerVehicleId, values) : await partnerApi.createVehicle(values)
      toast.success(isEdit ? 'Vehicle updated' : 'Vehicle added. Now upload its documents.')
      onSaved(saved)
      onOpenChange(false)
    } catch (error) {
      applyFieldErrors(error, setError)
      toast.error(errorMessage(error))
    }
  })

  return (
    <Dialog open={!!vehicle} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit vehicle' : 'Add a vehicle'}</DialogTitle>
            <DialogDescription>Each physical vehicle is listed once. Customers book the vehicle type, not the exact vehicle.</DialogDescription>
          </DialogHeader>

          <FormField
            id="v-reg"
            label="Registration number"
            placeholder="GA 07 AB 1234"
            autoCapitalize="characters"
            readOnly={lockRegistration}
            hint={lockRegistration ? 'Locked because documents were uploaded for this number.' : undefined}
            error={errors.registrationNumber?.message}
            {...register('registrationNumber')}
          />
          <SelectField
            id="v-model"
            label="Vehicle (make and model)"
            hint={
              chosen
                ? `Type: ${chosen.vehicleTypeName} (${chosen.categoryName})`
                : 'Not in the list? Contact us and we’ll add it.'
            }
            error={errors.vehicleId?.message}
            {...register('vehicleId')}
          >
            <option value="">Choose…</option>
            {modelGroups.map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((m) => (
                  <option key={m.vehicleId} value={m.vehicleId}>
                    {m.make} {m.model}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>
          <FormField
            id="v-year"
            label="Manufacturing year"
            type="number"
            min="1990"
            max={thisYear + 1}
            error={errors.manufacturingYear?.message}
            {...register('manufacturingYear')}
          />
          <SelectField
            id="v-location"
            label="Based at"
            hint="The pickup point this vehicle usually starts from."
            error={errors.pickupLocationId?.message}
            {...register('pickupLocationId')}
          >
            <option value="">Choose…</option>
            {(locations.data ?? []).map((l) => (
              <option key={l.pickupLocationId} value={l.pickupLocationId}>
                {l.name}
              </option>
            ))}
          </SelectField>
          <FormField
            id="v-radius"
            label="Delivery radius (km)"
            type="number"
            min="0"
            max="100"
            step="0.5"
            hint="How far you'll deliver this vehicle. Use 0 for pickup only."
            error={errors.deliveryRadiusKm?.message}
            {...register('deliveryRadiusKm')}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? 'Save' : 'Add vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
