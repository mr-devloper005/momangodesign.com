import Link from 'next/link'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export function EditableArticleArchive({
  posts,
  pagination,
  category = 'all',
  basePath = '/article',
}: {
  posts: SitePost[]
  pagination: SiteFeedPagination
  category?: string
  basePath?: string
}) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) =>
    `${basePath}?${new URLSearchParams({
      ...(category && category !== 'all' ? { category } : {}),
      page: String(nextPage),
    }).toString()}`

  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} py-14 md:py-24`}>
        <EditableReveal index={0}>
          <span className={dc.badge.accentPill}>{voice.eyebrow}</span>
          <h1 className={`mt-6 ${dc.type.heroTitle}`}>{voice.headline}</h1>
          <p className={`mt-5 max-w-2xl ${dc.type.body}`}>{voice.description}</p>
          <form action={basePath} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <select
              name="category"
              defaultValue={category || 'all'}
              className="min-w-0 flex-1 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 text-[0.9375rem] font-medium text-[var(--slot4-page-text)] outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className={dc.button.primary}>Filter</button>
          </form>
        </EditableReveal>
      </section>

      <section className={`${dc.shell.section} pb-24`}>
        {posts.length ? (
          <div className="grid gap-5">
            {posts.map((post, index) => (
              <EditableReveal key={post.id} index={index}>
                <ArticleListCard
                  post={post}
                  href={postHref('article', post, basePath)}
                  index={index + (page - 1) * pagination.limit}
                />
              </EditableReveal>
            ))}
          </div>
        ) : (
          <div className={`${dc.surface.soft} p-10 text-center`}>
            <h2 className="editable-display text-[1.5rem] font-semibold tracking-[-0.02em]">Nothing here yet</h2>
            <p className="mt-3 text-[0.9375rem] text-[var(--slot4-muted-text)]">Try another category or head back to the full feed.</p>
          </div>
        )}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? (
            <Link href={pageHref(page - 1)} className="rounded-full border border-[var(--editable-border)] bg-white px-5 py-2.5 text-[0.9375rem] font-medium">Previous</Link>
          ) : null}
          <span className="rounded-full bg-[var(--slot4-dark-bg)] px-5 py-2.5 text-[0.9375rem] font-medium text-white">
            Page {page} of {pagination.totalPages || 1}
          </span>
          {pagination.hasNextPage ? (
            <Link href={pageHref(page + 1)} className="rounded-full border border-[var(--editable-border)] bg-white px-5 py-2.5 text-[0.9375rem] font-medium">Next</Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} py-14 md:py-20`}>
        <EditableReveal index={0}>
          <Link href="/article" className={dc.button.secondary}>
            <ChevronLeft className="h-4 w-4" /> Field notes
          </Link>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <span className={dc.badge.accentPill}>{voice.eyebrow}</span>
              <h1 className={`mt-6 ${dc.type.heroTitle}`}>{post?.title || pagesContent.detailPages.article.fallbackTitle}</h1>
            </div>
            <aside className={`${dc.surface.dark} p-8`}>
              <span className="editable-label text-[0.75rem] font-medium text-white/60">Reading note</span>
              <p className="mt-4 text-[0.9375rem] leading-[1.6] text-white/75">{voice.secondaryNote}</p>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.9375rem] font-medium text-[var(--slot4-dark-bg)] transition hover:bg-[var(--slot4-accent)] hover:text-white">
                Contact <ArrowUpRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </EditableReveal>
      </section>
      <section className="mx-auto w-full max-w-4xl px-5 pb-24 pt-4 sm:px-8">
        <div className={`${dc.surface.card} p-8 sm:p-10`}>
          <p className={`text-[1rem] leading-[1.7] ${dc.type.body}`}>
            {post?.summary || `Field-note content for ${slug} will render through the editable detail page.`}
          </p>
        </div>
      </section>
    </main>
  )
}
