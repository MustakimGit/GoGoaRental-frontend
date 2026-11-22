import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { applyFieldErrors, errorMessage } from '@/api/errors'
import NativeSelect from '@/components/NativeSelect'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import FormField from '@/features/auth/FormField'
import { adminApi } from './api'

const optionalNumber = (schema) => z.preprocess((v) => (v === '' || v == null ? null : Number(v)), schema.nullable())

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(100),
  isActive: z.boolean(),
})

const vehicleTypeSchema = z.object({
  vehicleCategoryId: z.coerce.number().int().positive('Choose a category'),
  name: z.string().trim().min(1, 'Enter a name').max(150),
  description: z.string().trim().max(1000).optional(),
  seatingCapacity: optionalNumber(z.number().int().min(1).max(60)),
  imageUrl: z.union([z.literal(''), z.url('Enter a full URL')]).optional(),
  status: z.enum(['Active', 'Inactive']),
})

const vehicleModelSchema = z.object({
  vehicleTypeId: z.coerce.number().int().positive('Choose a vehicle type'),
  make: z.string().trim().min(1, 'Enter the make').max(100),
  model: z.string().trim().min(1, 'Enter the model').max(100),
  isActive: z.boolean(),
})

const locationSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(150),
  address: z.string().trim().min(1, 'Enter the address').max(500),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  customerDeliveryFee: z.coerce.number().min(0, 'Can’t be negative'),
  isActive: z.boolean(),
})

/** Shared dialog shell: create when `item` has no id, edit otherwise. */
function EntityDialog({ open, onOpenChange, title, schema, defaults, save, onSaved, children }) {
  const form = useForm({ resolver: zodResolver(schema), values: defaults })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await save(values)
      toast.success('Saved')
      onSaved(saved)
      onOpenChange(false)
    } catch (error) {
      applyFieldErrors(error, form.setError)
      toast.error(errorMessage(error))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children(form)}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ActiveCheckbox({ register, name = 'isActive', label = 'Active (available to choose)' }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-primary" {...register(name)} />
      {label}
    </label>
  )
}

export function CategoryDialog({ item, onOpenChange, onSaved }) {
  const isEdit = !!item?.vehicleCategoryId
  return (
    <EntityDialog
      open={!!item}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit category' : 'New category'}
      schema={categorySchema}
      defaults={{ name: item?.name ?? '', isActive: item?.isActive ?? true }}
      save={(v) => (isEdit ? adminApi.updateCategory(item.vehicleCategoryId, v) : adminApi.createCategory(v))}
      onSaved={onSaved}
    >
      {({ register, formState: { errors } }) => (
        <>
          <FormField id="cat-name" label="Name" error={errors.name?.message} {...register('name')} />
          <ActiveCheckbox register={register} />
        </>
      )}
    </EntityDialog>
  )
}

export function VehicleTypeDialog({ item, categories, onOpenChange, onSaved }) {
  const isEdit = !!item?.vehicleTypeId
  return (
    <EntityDialog
      open={!!item}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit vehicle type' : 'New vehicle type'}
      schema={vehicleTypeSchema}
      defaults={{
        vehicleCategoryId: item?.vehicleCategoryId ?? '',
        name: item?.name ?? '',
        description: item?.description ?? '',
        seatingCapacity: item?.seatingCapacity ?? '',
        imageUrl: item?.imageUrl ?? '',
        status: item?.status ?? 'Active',
      }}
      save={(v) => {
        const body = { ...v, imageUrl: v.imageUrl || null, description: v.description || null }
        return isEdit ? adminApi.updateVehicleType(item.vehicleTypeId, body) : adminApi.createVehicleType(body)
      }}
      onSaved={onSaved}
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="vt-category">Category</Label>
            <NativeSelect id="vt-category" aria-invalid={errors.vehicleCategoryId ? true : undefined} {...register('vehicleCategoryId')}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.vehicleCategoryId} value={c.vehicleCategoryId}>
                  {c.name}
                  {c.isActive ? '' : ' (inactive)'}
                </option>
              ))}
            </NativeSelect>
            {errors.vehicleCategoryId && <p className="text-sm text-destructive">{errors.vehicleCategoryId.message}</p>}
          </div>
          <FormField
            id="vt-name"
            label="Name"
            hint="What customers book, e.g. “SUV” or “Non Gear”"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid gap-1.5">
            <Label htmlFor="vt-description">Description (optional)</Label>
            <Textarea id="vt-description" maxLength={1000} {...register('description')} />
          </div>
          <FormField
            id="vt-seats"
            label="Seats (optional)"
            type="number"
            min="1"
            max="60"
            error={errors.seatingCapacity?.message}
            {...register('seatingCapacity')}
          />
          <FormField id="vt-image" label="Image URL (optional)" type="url" error={errors.imageUrl?.message} {...register('imageUrl')} />
          <div className="grid gap-1.5">
            <Label htmlFor="vt-status">Status</Label>
            <NativeSelect id="vt-status" {...register('status')}>
              <option value="Active">Active: customers can book it</option>
              <option value="Inactive">Inactive: hidden</option>
            </NativeSelect>
          </div>
        </>
      )}
    </EntityDialog>
  )
}

/** A make + model in the shared list partners pick from. Renaming it also renames partners' vehicles of this model. */
export function VehicleModelDialog({ item, types, onOpenChange, onSaved }) {
  const isEdit = !!item?.vehicleId
  return (
    <EntityDialog
      open={!!item}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit vehicle model' : 'New vehicle model'}
      schema={vehicleModelSchema}
      defaults={{
        vehicleTypeId: item?.vehicleTypeId ?? '',
        make: item?.make ?? '',
        model: item?.model ?? '',
        isActive: item?.isActive ?? true,
      }}
      save={(v) => (isEdit ? adminApi.updateVehicleModel(item.vehicleId, v) : adminApi.createVehicleModel(v))}
      onSaved={onSaved}
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="vm-type">Vehicle type</Label>
            <NativeSelect id="vm-type" aria-invalid={errors.vehicleTypeId ? true : undefined} {...register('vehicleTypeId')}>
              <option value="">Choose…</option>
              {types.map((t) => (
                <option key={t.vehicleTypeId} value={t.vehicleTypeId}>
                  {t.categoryName}: {t.name}
                  {t.status === 'Active' ? '' : ' (inactive)'}
                </option>
              ))}
            </NativeSelect>
            {errors.vehicleTypeId && <p className="text-sm text-destructive">{errors.vehicleTypeId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="vm-make" label="Make" placeholder="Honda" error={errors.make?.message} {...register('make')} />
            <FormField id="vm-model" label="Model" placeholder="Activa 6G" error={errors.model?.message} {...register('model')} />
          </div>
          {isEdit && (
            <p className="text-sm text-muted-foreground">Changes also apply to partners’ vehicles of this model.</p>
          )}
          <ActiveCheckbox register={register} label="Active (partners can choose it)" />
        </>
      )}
    </EntityDialog>
  )
}

export function PickupLocationDialog({ item, onOpenChange, onSaved }) {
  const isEdit = !!item?.pickupLocationId
  return (
    <EntityDialog
      open={!!item}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit pickup location' : 'New pickup location'}
      schema={locationSchema}
      defaults={{
        name: item?.name ?? '',
        address: item?.address ?? '',
        latitude: item?.latitude ?? '',
        longitude: item?.longitude ?? '',
        customerDeliveryFee: item?.customerDeliveryFee ?? 0,
        isActive: item?.isActive ?? true,
      }}
      save={(v) => (isEdit ? adminApi.updatePickupLocation(item.pickupLocationId, v) : adminApi.createPickupLocation(v))}
      onSaved={onSaved}
    >
      {({ register, formState: { errors } }) => (
        <>
          <FormField id="loc-name" label="Name" error={errors.name?.message} {...register('name')} />
          <FormField id="loc-address" label="Address" error={errors.address?.message} {...register('address')} />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="loc-lat"
              label="Latitude"
              type="number"
              step="0.000001"
              error={errors.latitude?.message}
              {...register('latitude')}
            />
            <FormField
              id="loc-lng"
              label="Longitude"
              type="number"
              step="0.000001"
              error={errors.longitude?.message}
              {...register('longitude')}
            />
          </div>
          <FormField
            id="loc-fee"
            label="Delivery fee charged to customer (₹)"
            type="number"
            min="0"
            step="1"
            error={errors.customerDeliveryFee?.message}
            {...register('customerDeliveryFee')}
          />
          <ActiveCheckbox register={register} />
        </>
      )}
    </EntityDialog>
  )
}
