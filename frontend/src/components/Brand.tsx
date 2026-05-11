import { cn } from '@/lib/utils'

interface BrandProps {
  className?: string
  showTagline?: boolean
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn('h-8 w-8', className)}
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="currentColor"
        className="text-primary"
      />
      <path
        d="M16 6v20M6 16h20M16 6c3 2.5 4.5 6 4.5 10s-1.5 7.5-4.5 10M16 6c-3 2.5-4.5 6-4.5 10s1.5 7.5 4.5 10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3" fill="white" />
    </svg>
  )
}

export function Brand({ className, showTagline = true }: BrandProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark />
      <div className="flex flex-col leading-tight">
        <span className="font-display text-lg font-bold tracking-tight">
          CanchaYa
        </span>
        {showTagline && (
          <span className="text-[0.7rem] font-medium text-muted-foreground">
            Reservá tu turno
          </span>
        )}
      </div>
    </div>
  )
}
