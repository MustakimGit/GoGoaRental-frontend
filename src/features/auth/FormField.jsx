import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** `prefix` shows fixed text inside the start of the box (e.g. "+91") that is not part of the value. */
export default function FormField({ id, label, error, hint, prefix, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const input = <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...inputProps} className={prefix ? 'pl-12' : undefined} />
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {prefix ? (
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r px-2.5 text-sm text-muted-foreground">
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
