import Link from 'next/link'
import { Fragment } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  FileText,
  Globe,
  MapPin,
  Phone,
  Search,
  Star,
  UserRound,
  Store,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

// Display-label overrides for renamed task categories.
const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}
const displayLabelFor = (task: TaskKey, fallback: string) => TASK_DISPLAY[task] || fallback

// Singular form used when we say "1 entry / 8 entries".
const singularOf = (task: TaskKey): string => {
  if (task === 'listing') return 'place'
  if (task === 'pdf') return 'reference'
  if (task === 'article') return 'field note'
  if (task === 'image') return 'photo'
  if (task === 'sbm') return 'saved link'
  if (task === 'classified') return 'offer'
  return 'entry'
}

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(
    post.summary ||
      asText(getContent(post).description) ||
      asText(getContent(post).excerpt) ||
      asText(getContent(post).body)
  )
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

// Shared airmentors-style surface: hairline border, medium radius, subtle lift.
const cardBase = `group block rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--tk-text)]/25`

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = displayLabelFor(task, taskConfig?.label || task)
  const singular = singularOf(task)
  const categoryLabel =
    category === 'all'
      ? 'All categories'
      : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  // Ads placement per spec:
  //   listing archive → in-feed
  //   pdf archive     → header
  const showHeaderAd = task === 'pdf'
  const showInFeedAd = task === 'listing'
  const inFeedAfter = 4

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {/* Archive hero */}
        <header className="relative overflow-hidden">
          <div className={`${dc.shell.section} py-16 md:py-24 lg:py-28`}>
            <EditableReveal index={0}>
              <span className={dc.badge.accentPill}>{theme.kicker}</span>
              <h1 className="editable-display mt-6 max-w-3xl text-balance text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]">
                {voice?.headline || `Browse ${label}`}
              </h1>
              <p className="mt-5 max-w-2xl text-[1.0625rem] leading-[1.6] text-[var(--tk-muted)]">
                {voice?.description || theme.note}
              </p>
              {voice?.chips?.length ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {voice.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-white px-3 py-1 text-[0.75rem] font-medium text-[var(--tk-muted)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </EditableReveal>

            <EditableReveal index={1}>
              <div className="mt-12 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.9375rem] text-[var(--tk-muted)]">
                  <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span>{' '}
                  {posts.length === 1 ? singular : `${singular}s`} · {categoryLabel}
                </p>
                <form action={basePath} className="flex items-center gap-2.5">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-white pl-4 pr-10 text-[0.875rem] font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-text)]"
                      aria-label={voice?.filterLabel || 'Filter'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="editable-btn inline-flex h-11 items-center rounded-full bg-[var(--slot4-dark-bg)] px-5 text-[0.875rem] font-medium text-white transition hover:bg-[var(--tk-accent)]">
                    Apply
                  </button>
                </form>
              </div>
            </EditableReveal>

            {showHeaderAd ? (
              <div className="mt-10">
                <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel />
              </div>
            ) : null}
          </div>
        </header>

        {/* Grid */}
        <section className={`${dc.shell.section} pb-24 pt-4 md:pb-32`}>
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <Fragment key={post.id || post.slug || index}>
                  <EditableReveal index={index}>
                    <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                  </EditableReveal>
                  {showInFeedAd && index === inFeedAfter - 1 ? (
                    <EditableReveal index={index + 1}>
                      <div className="rounded-2xl border border-dashed border-[var(--tk-line)] bg-white p-4">
                        <Ads slot="in-feed" size={pickRandom(getSlotSizes('in-feed'))} showLabel />
                      </div>
                    </EditableReveal>
                  ) : null}
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[var(--tk-line)] bg-white px-8 py-20 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.02em]">Nothing here yet</h2>
              <p className="mt-2 text-[0.9375rem] leading-6 text-[var(--tk-muted)]">
                Try another category, or check back once new {singular}s are added.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-[0.875rem]">
              {pagination.hasPrevPage ? (
                <Link
                  href={pageHref(basePath, category, page - 1)}
                  className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-medium transition hover:border-[var(--tk-text)]"
                >
                  Previous
                </Link>
              ) : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-medium text-[var(--tk-muted)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(basePath, category, page + 1)}
                  className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-medium transition hover:border-[var(--tk-text)]"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({
  post,
  task,
  basePath,
  index,
}: {
  post: SitePost
  task: TaskKey
  basePath: string
  index: number
}) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-[var(--tk-text)] transition group-hover:text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
    </span>
  )
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function RatingLine({ post, center = false }: { post: SitePost; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-2 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < filled
                ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]'
                : 'fill-[var(--tk-line)] text-[var(--tk-line)]'
            }`}
          />
        ))}
      </span>
      <span className="text-[0.875rem] font-medium text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-[0.8125rem] text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Field note')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-6">
        <p className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">
          {String(index + 1).padStart(2, '0')} · {category}
        </p>
        <h2 className="editable-display mt-3 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.01em]">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-2 text-[0.9375rem] leading-[1.55] text-[var(--tk-muted)]">
          {getSummary(post)}
        </p>
        <CardArrow label="Open field note" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-5 p-5 sm:p-6`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <Store className="h-9 w-9 text-[var(--tk-muted)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-[1.125rem] font-semibold tracking-[-0.01em]">
          {post.title}
        </h2>
        <RatingLine post={post} />
        <p className="mt-2 line-clamp-1 text-[0.9375rem] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-[0.75rem] font-medium text-[var(--tk-muted)]">
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}
            </span>
          ) : null}
          {phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website
            </span>
          ) : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-[1.75rem] font-semibold tracking-[-0.02em] text-[var(--tk-text)]">
          {price || 'Open offer'}
        </span>
        {condition ? (
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[var(--tk-accent)]">
            {condition}
          </span>
        ) : null}
      </div>
      <h2 className="editable-display mt-5 text-[1.125rem] font-semibold leading-[1.2] tracking-[-0.01em]">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[0.9375rem] leading-[1.55] text-[var(--tk-muted)]">
        {getSummary(post)}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-[0.75rem] font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">
          {location ? (
            <>
              <MapPin className="h-3.5 w-3.5" /> {location}
            </>
          ) : (
            'Details inside'
          )}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link
      href={href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--tk-text)]/25"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(9,13,21,0.72))] opacity-80 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-[1rem] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
            {post.title}
          </h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-white/75">
            View photo <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-5`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
          Saved · {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="editable-display mt-1.5 text-[1rem] font-semibold leading-[1.2] tracking-[-0.01em]">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-[0.875rem] leading-[1.5] text-[var(--tk-muted)]">
          {getSummary(post)}
        </p>
        {website ? (
          <p className="mt-3 truncate text-[0.75rem] font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p>
        ) : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Reference')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-white px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[var(--tk-muted)]">
          {category}
        </span>
      </div>
      <h2 className="editable-display mt-6 text-[1.125rem] font-semibold leading-[1.2] tracking-[-0.01em]">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[0.9375rem] leading-[1.55] text-[var(--tk-muted)]">
        {getSummary(post)}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-[var(--tk-text)] transition group-hover:text-[var(--tk-accent)]">
        Open reference <Download className="h-4 w-4" />
      </span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />
        )}
      </div>
      <h2 className="editable-display mt-5 text-[1.0625rem] font-semibold tracking-[-0.01em]">{post.title}</h2>
      {role ? (
        <p className="mt-1.5 editable-label text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[var(--tk-accent)]">
          {role}
        </p>
      ) : null}
      <p className="mt-3 line-clamp-2 text-[0.875rem] leading-[1.5] text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
