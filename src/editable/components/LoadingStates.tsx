import { cn } from '@/lib/utils'

type LoadingStateProps = {
  label?: string
  className?: string
}

function PulseBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-[var(--editable-border)]', className)} />
}

export function PageLoadingState({ label = 'Loading', className }: LoadingStateProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[90rem] px-5 py-14 sm:px-8 lg:px-12 xl:px-16', className)} aria-live="polite" aria-busy="true">
      <p className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{label}</p>
      <PulseBlock className="mt-5 h-12 w-3/4 max-w-3xl" />
      <PulseBlock className="mt-4 h-5 w-2/3 max-w-2xl" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-[var(--editable-border)] p-5">
            <PulseBlock className="h-44 w-full" />
            <PulseBlock className="mt-5 h-5 w-4/5" />
            <PulseBlock className="mt-3 h-4 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardGridLoadingState({ count = 6, className }: LoadingStateProps & { count?: number }) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)} aria-live="polite" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-[var(--editable-border)] p-4">
          <PulseBlock className="h-40 w-full" />
          <PulseBlock className="mt-4 h-5 w-5/6" />
          <PulseBlock className="mt-3 h-4 w-2/3" />
          <PulseBlock className="mt-6 h-9 w-32 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DetailLoadingState({ label = 'Loading', className }: LoadingStateProps) {
  return (
    <div className={cn('mx-auto grid w-full max-w-[80rem] gap-10 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr] sm:px-8', className)} aria-live="polite" aria-busy="true">
      <PulseBlock className="h-80 w-full rounded-2xl" />
      <div>
        <p className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{label}</p>
        <PulseBlock className="mt-5 h-12 w-4/5" />
        <PulseBlock className="mt-5 h-4 w-full" />
        <PulseBlock className="mt-3 h-4 w-5/6" />
        <PulseBlock className="mt-3 h-4 w-2/3" />
      </div>
    </div>
  )
}
