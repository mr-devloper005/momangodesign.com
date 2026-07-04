import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'
import { formatRichHtml } from '@/components/shared/rich-content'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}
const displayLabelFor = (task: TaskKey, fallback: string) => TASK_DISPLAY[task] || fallback

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) =>
  typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images)
    ? ((content.images.find((item) => typeof item === 'string') as string | undefined) || '')
    : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) =>
  post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [
    post.title,
    post.summary,
    content.description,
    content.body,
    content.excerpt,
    content.category,
    Array.isArray(post.tags) ? post.tags.join(' ') : '',
  ].some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post }: { post: SitePost }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const label = task ? displayLabelFor(task, SITE_CONFIG.tasks.find((i) => i.key === task)?.label || 'Entry') : 'Entry'

  return (
    <Link
      href={href}
      className={`group block overflow-hidden ${dc.surface.card} transition duration-300 hover:-translate-y-0.5 hover:border-[var(--slot4-page-text)]/25`}
    >
      {image ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        </div>
      ) : null}
      <div className="p-5">
        <span className={dc.badge.pill}>{label}</span>
        <h2 className="editable-display mt-3 line-clamp-2 text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.01em]">
          {post.title}
        </h2>
        {summary ? (
          <div
            className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]"
            dangerouslySetInnerHTML={{ __html: formatRichHtml(summary) }}
          />
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[var(--slot4-page-text)] transition group-hover:text-[var(--slot4-accent)]">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(
    useMaster ? 1000 : 300,
    useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined
  )
  const posts =
    feed?.posts?.length
      ? feed.posts
      : useMaster
        ? []
        : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-14 md:py-20`}>
          <EditableReveal index={0}>
            <div className={`${dc.surface.card} p-6 sm:p-10`}>
              <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <span className={dc.badge.accentPill}>{pagesContent.search.hero.badge}</span>
                  <h1 className={`mt-5 ${dc.type.heroTitle}`}>{pagesContent.search.hero.title}</h1>
                  <p className={`mt-5 max-w-xl ${dc.type.body}`}>{pagesContent.search.hero.description}</p>
                </div>
                <form action="/search" className="self-end">
                  <input type="hidden" name="master" value="1" />
                  <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3">
                    <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                    <input
                      name="q"
                      defaultValue={query}
                      placeholder={pagesContent.search.hero.placeholder}
                      className="min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                    />
                  </label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2.5">
                      <Filter className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                      <input
                        name="category"
                        defaultValue={category}
                        placeholder="Category"
                        className="min-w-0 flex-1 bg-transparent text-[0.875rem] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                      />
                    </label>
                    <select
                      name="task"
                      defaultValue={task}
                      className="rounded-full border border-[var(--editable-border)] bg-white px-4 py-2.5 text-[0.875rem] font-medium outline-none"
                    >
                      <option value="">All categories</option>
                      {enabledTasks.map((item) => (
                        <option key={item.key} value={item.key}>
                          {displayLabelFor(item.key as TaskKey, item.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className={`mt-4 w-full ${dc.button.primary}`} type="submit">
                    Search
                  </button>
                </form>
              </div>
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
                <h2 className="editable-display mt-2 text-[1.5rem] font-semibold tracking-[-0.02em] sm:text-[2rem]">
                  {query ? `Results for "${query}"` : pagesContent.search.resultsTitle}
                </h2>
              </div>
              <Link href="/" className={dc.button.secondary}>
                Back to home <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>

          {results.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug || index} index={index + 2}>
                  <SearchResultCard post={post} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--editable-border)] bg-white p-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--slot4-muted-text)]" />
              <h3 className="editable-display mt-5 text-[1.5rem] font-semibold tracking-[-0.02em]">Nothing matched.</h3>
              <p className="mt-2 text-[0.9375rem] text-[var(--slot4-muted-text)]">
                Try a different keyword or open one of the categories.
              </p>
            </div>
          )}

          {/* Search page footer ad — per ads placement rules */}
          <div className="mt-16 rounded-2xl border border-dashed border-[var(--editable-border)] bg-white p-4">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
