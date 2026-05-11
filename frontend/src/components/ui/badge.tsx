import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive/15 text-destructive dark:bg-destructive/30 dark:text-destructive-foreground',
        outline: 'text-foreground border-border',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-200',
        warning:
          'border-transparent bg-amber-500/20 text-amber-800 dark:bg-amber-500/25 dark:text-amber-100',
        accent:
          'border-transparent bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground',
        muted:
          'border-transparent bg-muted text-muted-foreground dark:bg-muted/80 dark:text-foreground/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
