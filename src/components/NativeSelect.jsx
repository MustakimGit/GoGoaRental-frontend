import { cn } from '@/lib/utils'

// A plain <select> styled like the shadcn Input, so it works directly with react-hook-form's register().
export default function NativeSelect({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors md:text-sm',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
