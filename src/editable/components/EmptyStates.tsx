import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'New entries will appear here automatically once they are added to this section.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--editable-border)] bg-white p-10 text-center',
        className
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <SearchX className="h-5 w-5" />
      </div>
      <h2 className="editable-display mt-5 text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-[1.55] text-[var(--slot4-muted-text)]">
        {description}
      </p>
      <Link
        href={actionHref}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-[0.9375rem] font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-page-text)] hover:bg-[var(--slot4-page-text)] hover:text-white"
      >
        {actionLabel}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'entries', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`New ${taskLabel} will show up here as soon as they are added. The page stays ready even when the feed is empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out — your request is in the queue and someone will get back to you shortly."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
