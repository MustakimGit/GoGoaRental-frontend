import { Bus, Check, ChevronDown, MapPin, Plane, Repeat, TrainFront, TreePalm } from 'lucide-react'
import { Select } from 'radix-ui'
import { cn } from '@/lib/utils'

// Picks an icon from the location's name/address, so new admin-added locations get one automatically.
function iconFor(location) {
  const text = `${location.name} ${location.address ?? ''}`
  if (/airport/i.test(text)) return Plane
  if (/bus stand|bus station/i.test(text)) return Bus
  if (/railway|station/i.test(text)) return TrainFront
  if (/beach/i.test(text)) return TreePalm
  return MapPin
}

// Radix items can't use '' as a value, so the optional "none" choice gets a sentinel that maps back to ''.
const NONE = '__none'

/**
 * Location dropdown with an icon per location (a native <select> can't show icons).
 * `noneLabel` adds a first choice that means "no specific location" and reports '' (used for "Same as pickup point").
 */
export default function PickupLocationSelect({
  id,
  name = 'location',
  locations,
  value,
  onChange,
  required,
  noneLabel,
  placeholder = 'Choose where to pick up…',
}) {
  const current = value ? String(value) : noneLabel ? NONE : ''
  return (
    <Select.Root value={current} onValueChange={(v) => onChange(v === NONE ? '' : v)} required={required} name={name}>
      <Select.Trigger
        id={id}
        className={cn(
          'flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base outline-none transition-colors md:text-sm',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
          'data-[placeholder]:text-muted-foreground',
        )}
      >
        <span className="min-w-0 truncate">
          <Select.Value placeholder={placeholder} />
        </span>
        <Select.Icon asChild>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] min-w-56 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          <Select.Viewport className="p-1">
            {noneLabel && (
              <Select.Item
                value={NONE}
                className="relative flex cursor-pointer select-none items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <Select.ItemText>
                  <span className="flex items-center gap-2">
                    <Repeat className="size-4 shrink-0 text-brand-palm" aria-hidden="true" />
                    <span className="truncate">{noneLabel}</span>
                  </span>
                </Select.ItemText>
                <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check className="size-4" aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            )}
            {locations.map((l) => {
              const Icon = iconFor(l)
              return (
                <Select.Item
                  key={l.pickupLocationId}
                  value={String(l.pickupLocationId)}
                  className="relative flex cursor-pointer select-none items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  <Select.ItemText>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-brand-palm" aria-hidden="true" />
                      <span className="truncate">{l.name}</span>
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                    <Check className="size-4" aria-hidden="true" />
                  </Select.ItemIndicator>
                </Select.Item>
              )
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
