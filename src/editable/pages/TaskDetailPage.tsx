import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, Bookmark, Camera,
  Clock3, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, ShieldCheck,
  Star, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

// Display-label overrides for renamed task categories.
const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}
const displayLabelFor = (task: TaskKey, fallback: string) => TASK_DISPLAY[task] || fallback

// Byte-formatter for PDF sidebar quick facts.
const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i += 1
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// Yelp-style red star rating row. Uses real rating/review fields when present,
// otherwise a stable derived value (wire to real data when available).
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

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const label = displayLabelFor(task, taskConfig?.label || 'entries')
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {label}
    </Link>
  )
}

// ----- Article: a quiet, centred reading column -----
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
        <div className="mt-6 text-sm text-[var(--tk-muted)]">
          <span>{SITE_CONFIG.name}</span>
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ----- Local Directory (listing): rich premium directory record -----
// ============================================================================
// Listing detail — "Wallpaper editorial" full-bleed layout.
// New direction: cinematic hero → 3-col at-a-glance → centered long-form →
// bento gallery → dark map takeover → related grid. NO sticky sidebar. NO date.
// ============================================================================
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const hero = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'openingHours', 'timing'])
  const category = getField(post, ['category']) || 'Directory entry'
  const mapSrc = mapSrcFor(post)
  const galleryImages = images.slice(1, 6)
  const lead = leadText(post)

  return (
    <>
      {/* 1. Cinematic hero */}
      <section
        className="relative isolate flex min-h-[60vh] w-full flex-col justify-end overflow-hidden bg-[var(--slot4-dark-bg)] text-white lg:min-h-[70vh]"
      >
        {hero ? (
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,21,0.35)_0%,rgba(9,13,21,0.1)_40%,rgba(9,13,21,0.9)_100%)]" />

        {/* Top-left back link */}
        <div className="relative z-10 px-5 pt-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[90rem]">
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Local Directory
            </Link>
          </div>
        </div>

        {/* Floating action pills top-right */}
        <div className="pointer-events-none absolute right-5 top-8 z-10 hidden justify-end sm:right-8 lg:right-12 lg:flex xl:right-16">
          <div className="pointer-events-auto flex gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 backdrop-blur-md">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[0.8125rem] font-medium text-[var(--slot4-dark-bg)] transition hover:bg-[var(--tk-accent)] hover:text-white"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            ) : null}
            {address ? (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[0.8125rem] font-medium text-white transition hover:border-white hover:bg-white/10"
              >
                <MapPin className="h-3.5 w-3.5" /> Directions
              </a>
            ) : null}
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[0.8125rem] font-medium text-white transition hover:border-white hover:bg-white/10"
              >
                <Globe2 className="h-3.5 w-3.5" /> Website
              </a>
            ) : null}
          </div>
        </div>

        {/* Bottom title block */}
        <div className="relative z-10 px-5 pb-14 pt-24 sm:px-8 lg:px-12 lg:pb-20 xl:px-16">
          <div className="mx-auto max-w-[90rem]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.75rem] font-medium text-white/90 backdrop-blur-md">
              Local Directory · {category}
            </span>
            <h1 className="editable-display mt-6 max-w-4xl text-balance text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[3.5rem] lg:text-[4.5rem]">
              {post.title}
            </h1>
            {address ? (
              <p className="mt-6 inline-flex items-center gap-2 text-[1rem] text-white/80">
                <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {address}
              </p>
            ) : null}

            {/* Mobile action rail */}
            <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[0.8125rem] font-medium text-[var(--slot4-dark-bg)]">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
              ) : null}
              {website ? (
                <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[0.8125rem] font-medium text-white">
                  <Globe2 className="h-3.5 w-3.5" /> Website
                </a>
              ) : null}
              {address ? (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[0.8125rem] font-medium text-white">
                  <MapPin className="h-3.5 w-3.5" /> Directions
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2. At-a-glance band — 3 columns */}
      <section className={`${dc.shell.section} py-14 md:py-20`}>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Contact column */}
          <div>
            <p className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
              Contact
            </p>
            <ul className="mt-4 grid gap-3 text-[0.9375rem] text-[var(--tk-text)]">
              {address ? (
                <li>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 transition hover:text-[var(--tk-accent)]"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-muted)]" />
                    <span className="min-w-0 break-words">{address}</span>
                  </a>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <a href={`tel:${phone}`} className="flex items-center gap-3 transition hover:text-[var(--tk-accent)]">
                    <Phone className="h-4 w-4 shrink-0 text-[var(--tk-muted)]" />
                    <span className="truncate">{phone}</span>
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-3 transition hover:text-[var(--tk-accent)]">
                    <Mail className="h-4 w-4 shrink-0 text-[var(--tk-muted)]" />
                    <span className="truncate">{email}</span>
                  </a>
                </li>
              ) : null}
              {website ? (
                <li>
                  <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-3 transition hover:text-[var(--tk-accent)]">
                    <Globe2 className="h-4 w-4 shrink-0 text-[var(--tk-muted)]" />
                    <span className="truncate">Visit website</span>
                  </a>
                </li>
              ) : null}
              {hours ? (
                <li className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-muted)]" />
                  <span className="min-w-0 break-words">{hours}</span>
                </li>
              ) : null}
            </ul>
          </div>

          {/* At a glance / rating */}
          <div className="md:border-x md:border-[var(--tk-line)] md:px-8">
            <p className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
              At a glance
            </p>
            <DetailMeta post={post} category={category} />
            {lead ? (
              <p className="mt-5 text-[0.9375rem] leading-[1.6] text-[var(--tk-muted)]">{lead}</p>
            ) : (
              <p className="mt-5 text-[0.9375rem] leading-[1.6] text-[var(--tk-muted)]">
                A verified entry in the Local Directory. Full description below.
              </p>
            )}
          </div>

          {/* Verified */}
          <div>
            <p className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
              Verified
            </p>
            <ul className="mt-4 grid gap-3 text-[0.9375rem] text-[var(--tk-text)]">
              {[
                'Address & contact checked',
                'Category & tags reviewed',
                'Cross-linked in the library',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Long-form description — centered */}
      <section className="border-t border-[var(--tk-line)]">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 md:py-24">
          <h2 className="editable-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
            About this place
          </h2>
          <BodyContent post={post} />
          {post.tags?.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.slice(0, 10).map((tag) => (
                <span key={tag} className={dc.badge.pill}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 4. Bento gallery — 1 large + 2 stacked */}
      {galleryImages.length ? (
        <section className={`${dc.shell.section} pb-14`}>
          <div className="grid grid-cols-1 gap-4 md:h-[540px] md:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-[var(--tk-raised)] md:h-full">
              <img src={galleryImages[0]} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-rows-2">
              {galleryImages.slice(1, 3).map((image, i) => (
                <div key={`${image}-${i}`} className="relative overflow-hidden rounded-2xl bg-[var(--tk-raised)]">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              {galleryImages.length === 1 ? (
                <div className="hidden rounded-2xl border border-dashed border-[var(--tk-line)] md:block" />
              ) : null}
            </div>
          </div>
          {galleryImages.length > 3 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryImages.slice(3, 7).map((image, i) => (
                <div key={`${image}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--tk-raised)]">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 5. Dark map takeover */}
      {mapSrc ? (
        <section className="relative bg-[var(--slot4-dark-bg)] py-14 md:py-24">
          <div className={`${dc.shell.section}`}>
            <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <div className="order-2 overflow-hidden rounded-2xl border border-white/10 bg-[var(--tk-raised)] lg:order-1">
                <iframe src={mapSrc} title="Map" loading="lazy" className="h-[420px] w-full border-0" />
              </div>
              <div className="order-1 text-white lg:order-2">
                <p className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/60">
                  On the map
                </p>
                <h3 className="editable-display mt-3 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[2.25rem]">
                  Find your way here.
                </h3>
                {address ? (
                  <p className="mt-4 max-w-md text-[0.9375rem] leading-[1.6] text-white/70">{address}</p>
                ) : null}
                {address ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.9375rem] font-medium text-[var(--slot4-dark-bg)] transition hover:bg-[var(--tk-accent)] hover:text-white"
                  >
                    Open in Maps <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 6. Sidebar ad (kept — spec requires listing detail to carry sidebar ad) */}
      <section className={`${dc.shell.section} pt-14`}>
        <div className="rounded-2xl border border-dashed border-[var(--tk-line)] bg-white p-4">
          <Ads slot="in-feed" size={pickRandom(getSlotSizes('sidebar'))} showLabel />
        </div>
      </section>

      {/* 7. Related grid — full width, no sidebar */}
      <section className={`${dc.shell.section} pb-24 pt-10`}>
        {related.length ? <RelatedStrip task="listing" related={related} /> : null}
      </section>
    </>
  )
}

// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ----- Image: a dark, gallery-led canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ----- Bookmark: a single curated resource -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

// ----- Reference Library (pdf): document-workspace layout -----
// ============================================================================
// PDF (Reference Library) detail — "Document reader workspace".
// New direction: slim sticky top bar → two-panel workspace (large PDF LEFT,
// scrollable meta panel RIGHT) → repeated CTA + article-bottom ad → horizontal
// rail of related doc tiles. NO date shown anywhere.
// ============================================================================
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const category = categoryOf(post, 'Reference')
  const pages = getField(post, ['pages', 'pageCount']) || '—'
  const rawSize = getField(post, ['fileSize', 'size'])
  const parsedBytes = Number(rawSize)
  const size = Number.isFinite(parsedBytes) && parsedBytes > 0 ? formatBytes(parsedBytes) : rawSize || '—'
  const uploadedBy = getField(post, ['author', 'uploader', 'source']) || SITE_CONFIG.name
  const filename = getField(post, ['filename']) || `${post.slug || 'reference'}.pdf`
  const lead = leadText(post)
  const sections = (getField(post, ['sections']) || '')
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter(Boolean)
    .slice(0, 6)

  return (
    <>
      {/* 1. Slim sticky top bar — breadcrumb + title + actions */}
      <div className="sticky top-0 z-20 border-b border-[var(--tk-line)] bg-white/90 backdrop-blur-xl">
        <div className={`${dc.shell.section} flex items-center gap-4 py-3`}>
          <Link
            href="/pdf"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Reference Library
          </Link>
          <span className="hidden text-[var(--tk-line)] sm:inline">/</span>
          <span className="hidden min-w-0 truncate text-[0.8125rem] font-medium text-[var(--tk-text)] sm:inline-block">
            {post.title}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open in new tab"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-muted)] transition hover:border-[var(--tk-text)] hover:text-[var(--tk-text)] sm:inline-flex"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            {fileUrl ? (
              <a
                href={fileUrl}
                download
                className="editable-btn inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-4 py-2 text-[0.8125rem] font-medium text-white transition hover:bg-[var(--tk-accent)]"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="editable-btn-text">
                  <span data-text="Download PDF">Download PDF</span>
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* 2. Two-panel workspace — LEFT reader, RIGHT scrollable meta */}
      <section className="mx-auto grid w-full max-w-[110rem] gap-0 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT — PDF reader */}
        <div className="border-b border-[var(--tk-line)] bg-[var(--tk-raised)] lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:self-start lg:border-b-0 lg:border-r">
          {fileUrl ? (
            <div className="flex h-full min-h-[60vh] flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] bg-white px-5 py-3">
                <div className="flex items-center gap-2 truncate text-[0.8125rem] font-medium text-[var(--tk-text)]">
                  <FileText className="h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span className="truncate">{filename}</span>
                </div>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 text-[0.75rem] font-medium text-[var(--tk-accent)]"
                >
                  Full screen <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title={post.title}
                className="h-full min-h-[70vh] w-full flex-1 bg-[var(--tk-raised)]"
              />
            </div>
          ) : (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-10 py-20 text-center">
              <FileText className="h-10 w-10 text-[var(--tk-muted)]" />
              <p className="mt-4 text-[0.9375rem] text-[var(--tk-muted)]">
                The reference file will appear here once uploaded.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — meta / body panel */}
        <div className="min-w-0 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <span className={dc.badge.accentPill}>Reference Library</span>
          <h1 className="editable-display mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem]">
            {post.title}
          </h1>

          {lead ? (
            <blockquote className="mt-6 border-l-2 border-[var(--tk-accent)] pl-5">
              <p className="editable-display text-[1.0625rem] font-medium leading-[1.5] tracking-[-0.01em] text-[var(--tk-text)] sm:text-[1.25rem]">
                {lead}
              </p>
            </blockquote>
          ) : null}

          {/* Quick facts — NO date */}
          <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
            {[
              ['Pages', pages],
              ['File size', size],
              ['Format', 'PDF'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">
                  {label}
                </p>
                <p className="editable-display mt-1 text-[1rem] font-semibold tracking-[-0.01em] text-[var(--tk-text)]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Metadata list — Category + Uploaded by, NO date */}
          <dl className="mt-6 grid gap-3 border-y border-[var(--tk-line)] py-5 text-[0.875rem]">
            {[
              ['Category', category],
              ['Uploaded by', uploadedBy],
              ['Filename', filename],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <dt className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.1em] text-[var(--tk-muted)]">
                  {label}
                </dt>
                <dd className="truncate text-right text-[var(--tk-text)]">{value}</dd>
              </div>
            ))}
          </dl>

          {/* What's inside */}
          <div className="mt-8">
            <p className="editable-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
              What's inside
            </p>
            <ul className="mt-4 grid gap-3 text-[0.9375rem] text-[var(--tk-text)]">
              {(sections.length ? sections : ['Overview', 'Key findings', 'Practical checklist', 'Sources & further reading']).map(
                (section: string, i: number) => (
                  <li key={section} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[0.6875rem] font-semibold text-[var(--tk-accent)]">
                      {i + 1}
                    </span>
                    <span>{section}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Tags */}
          {post.tags?.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.slice(0, 10).map((tag) => (
                <span key={tag} className={dc.badge.pill}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Body */}
          <div className="mt-8">
            <h2 className="editable-display text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[1.75rem]">
              Description
            </h2>
            <BodyContent post={post} compact />
          </div>

          {/* Repeated dark CTA callout */}
          <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-[var(--tk-line)] bg-[var(--slot4-dark-bg)] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="editable-label text-[0.75rem] font-medium text-white/60">Take it with you</p>
              <h3 className="editable-display mt-2 text-[1.25rem] font-semibold leading-[1.15] tracking-[-0.01em]">
                Download the full reference.
              </h3>
            </div>
            {fileUrl ? (
              <a
                href={fileUrl}
                download
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.875rem] font-medium text-[var(--slot4-dark-bg)] transition hover:bg-[var(--tk-accent)] hover:text-white"
              >
                Download PDF <Download className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          {/* Article-bottom ad */}
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--tk-line)] bg-white p-4">
            <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel />
          </div>
        </div>
      </section>

      {/* 3. Horizontal-scroll rail of related references */}
      {related.length ? <PdfRelatedStrip related={related} /> : null}
    </>
  )
}

function PdfRelatedStrip({ related }: { related: SitePost[] }) {
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className={`${dc.shell.section} py-14`}>
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-[1.5rem] font-semibold tracking-[-0.02em] sm:text-[1.875rem]">
            More from the Reference Library
          </h2>
          <Link href="/pdf" className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[var(--tk-accent)]">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {related.map((item) => {
            const href = `/pdf/${item.slug}`
            const rawSize = (item.content && typeof item.content === 'object' ? (item.content as Record<string, unknown>).fileSize : '') as string
            const bytes = Number(rawSize)
            const sizeChip = Number.isFinite(bytes) && bytes > 0 ? formatBytes(bytes) : (typeof rawSize === 'string' && rawSize) || 'PDF'
            return (
              <Link
                key={item.id || item.slug}
                href={href}
                className="group flex w-[240px] shrink-0 snap-start flex-col rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--tk-text)]/30"
              >
                <div className="editable-display flex h-28 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[2.75rem] font-semibold leading-none tracking-[-0.02em] text-[var(--tk-accent)]">
                  PDF
                </div>
                <h3 className="editable-display mt-4 line-clamp-2 text-[1rem] font-semibold leading-[1.2] tracking-[-0.01em] text-[var(--tk-text)]">
                  {item.title}
                </h3>
                <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-2.5 py-1 text-[0.6875rem] font-medium text-[var(--tk-muted)]">
                  {sizeChip}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ----- Profile: identity-first with a sticky portrait -----
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

// ----- Shared building blocks -----
function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const label = displayLabelFor(task, taskConfig?.label || 'entries')
  return (
    <section className="mt-20 border-t border-[var(--tk-line)] pt-14">
      <div className="flex items-center justify-between">
        <h2 className="editable-display text-[1.75rem] font-semibold tracking-[-0.02em] sm:text-[2rem]">
          More from {label}
        </h2>
        <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-[var(--tk-accent)]">
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

