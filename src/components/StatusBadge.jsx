import { cn } from '@/lib/utils'
import { statusTone } from '@/lib/labels'

const toneClasses = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  muted: 'bg-muted text-muted-foreground',
}

export default function StatusBadge({ value, labels, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        toneClasses[statusTone[value] ?? 'muted'],
        className,
      )}
    >
      {labels?.[value] ?? value}
    </span>
  )
}
