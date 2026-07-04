import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* Hero editorial card — dark ink panel with lead image, eyebrow, tight display h3, quiet CTA. */
export function EditorialFeatureCard({
  post,
  href,
  label = 'Featured story',
}: {
  post: SitePost
  href: string
  label?: string
}) {
  return (
    <Link
      href={href}
      className={`group relative block min-w-0 overflow-hidden ${dc.surface.dark} transition duration-300 hover:-translate-y-0.5`}
    >
      <div className={`${dc.media.frame} aspect-[16/10] rounded-none border-b border-white/10`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,21,0)_45%,rgba(9,13,21,0.6)_100%)]" />
      </div>
      <div className="p-6 sm:p-8">
        <span className="editable-label inline-flex items-center gap-2 text-[0.8125rem] font-medium text-white/60 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--slot4-accent)] before:content-['']">
          {label}
        </span>
        <h3 className="editable-display mt-4 line-clamp-3 text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2rem] lg:text-[2.25rem]">
          {post.title}
        </h3>
        <p className="mt-4 line-clamp-3 text-[0.9375rem] leading-[1.6] text-white/70">
          {getEditableExcerpt(post, 200)}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-white transition group-hover:text-[var(--slot4-accent)]">
          Read the story <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/* Rail card — compact vertical for horizontal scrolling shelves. */
export function RailPostCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
    >
      <div className={`${dc.media.frame} aspect-square rounded-none`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
      </div>
      <div className="p-4">
        <p className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">
          {String(index + 1).padStart(2, '0')} · {getEditableCategory(post)}
        </p>
        <h3 className={`mt-2 line-clamp-2 editable-display text-[1rem] font-semibold leading-[1.25] tracking-[-0.01em] ${pal.panelText}`}>
          {post.title}
        </h3>
      </div>
    </Link>
  )
}

/* Compact numbered list-style card. */
export function CompactIndexCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className={`group block min-w-0 ${dc.surface.soft} p-5 ${dc.motion.lift}`}
    >
      <div className="flex items-start gap-4">
        <span className="editable-label mt-1 shrink-0 rounded-full border border-[var(--editable-border)] bg-white px-2.5 py-0.5 text-[0.75rem] font-medium text-[var(--slot4-muted-text)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="editable-label text-[0.75rem] font-medium text-[var(--slot4-accent)]">
            {getEditableCategory(post)}
          </p>
          <h3 className={`mt-1.5 line-clamp-2 editable-display text-[1.125rem] font-semibold leading-[1.25] tracking-[-0.01em] ${pal.panelText}`}>
            {post.title}
          </h3>
          <p className={`mt-2 line-clamp-2 text-[0.875rem] leading-[1.55] ${pal.mutedText}`}>
            {getEditableExcerpt(post, 110)}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* Article-list horizontal card — image left, editorial block right. */
export function ArticleListCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className={`group grid min-w-0 gap-6 overflow-hidden ${dc.surface.card} p-4 ${dc.motion.lift} sm:grid-cols-[260px_minmax(0,1fr)]`}
    >
      <div className={`${dc.media.frame} aspect-[16/11] sm:aspect-auto sm:min-h-[220px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
      </div>
      <div className="min-w-0 p-2 sm:py-5 sm:pr-6">
        <p className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[var(--slot4-muted-text)]">
          {String(index + 1).padStart(2, '0')} · {getEditableCategory(post)}
        </p>
        <h2 className={`mt-3 line-clamp-3 editable-display text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.02em] ${pal.panelText} sm:text-[1.75rem]`}>
          {post.title}
        </h2>
        <p className={`mt-3 line-clamp-3 text-[0.9375rem] leading-[1.6] ${pal.mutedText}`}>
          {getEditableExcerpt(post, 200)}
        </p>
        <span className={`mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-medium ${pal.panelText} transition group-hover:text-[var(--slot4-accent)]`}>
          Open <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
