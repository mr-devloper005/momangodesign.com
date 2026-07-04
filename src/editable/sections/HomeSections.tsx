import Link from 'next/link'
import {
  ArrowUpRight,
  Compass,
  BookOpen,
  Sparkles,
  MapPin,
  Download,
  Search,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, getEditableExcerpt, getEditableCategory, postHref } from '@/editable/cards/PostCards'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}

function displayLabelFor(task: TaskKey) {
  return TASK_DISPLAY[task] || SITE_CONFIG.tasks.find((t) => t.key === task)?.label || 'Featured'
}

/* Hero — off-white panel, eyebrow pill, huge Inter Tight h1, dual pill CTA,
   right-hand product panel of stacked bordered cards. */
export function EditableHomeHero({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const site = SITE_CONFIG
  const hero = pagesContent.home?.hero
  const feature = posts[0]
  const supporting = posts.slice(1, 4)
  const primaryLabel = displayLabelFor(primaryTask)

  const heroTitle = hero?.title || `The ${site.name} directory and reference library.`
  const heroDesc =
    hero?.description ||
    `Verified places to visit and downloadable references worth keeping — all in one calm library.`

  return (
    <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
        <EditableReveal index={0}>
          <div>
            <span className={dc.badge.accentPill}>New · {primaryLabel}</span>
            <h1 className={`mt-6 ${dc.type.heroTitle} text-[var(--slot4-page-text)]`}>{heroTitle}</h1>
            <p className={`mt-6 max-w-xl ${dc.type.body}`}>{heroDesc}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href={primaryRoute} className={dc.button.primary}>
                <span className="editable-btn-text"><span data-text={`Browse ${primaryLabel}`}>{`Browse ${primaryLabel}`}</span></span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/search" className={dc.button.secondary}>
                <Search className="h-4 w-4" /> Search everything
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6">
              {[
                { label: 'Places listed', value: `${Math.max(24, posts.length * 8)}+` },
                { label: 'Reference docs', value: `${Math.max(12, posts.length * 3)}+` },
                { label: 'Categories', value: `${SITE_CONFIG.tasks.filter((t) => t.enabled).length}` },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="editable-label text-[0.75rem] font-medium text-[var(--slot4-muted-text)]">{stat.label}</dt>
                  <dd className="editable-display mt-1 text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--slot4-page-text)]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </EditableReveal>

        <EditableReveal index={1}>
          <div className="relative">
            {feature ? (
              <Link
                href={postHref(primaryTask, feature, primaryRoute)}
                className={`group relative block overflow-hidden ${dc.surface.card} p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--slot4-page-text)]/40`}
              >
                <div className={`${dc.media.frame} aspect-[4/3] rounded-xl`}>
                  <img
                    src={getEditablePostImage(feature)}
                    alt={feature.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <span className={dc.badge.pill}>{getEditableCategory(feature)}</span>
                  <h3 className="editable-display mt-3 line-clamp-2 text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[0.9375rem] text-[var(--slot4-muted-text)]">{getEditableExcerpt(feature, 140)}</p>
                </div>
              </Link>
            ) : (
              <div className={`${dc.surface.card} p-10 text-center text-[var(--slot4-muted-text)]`}>
                Publish your first entry to see it featured here.
              </div>
            )}

            {/* Floating supporting chips */}
            <div className="pointer-events-none absolute -bottom-6 -left-6 hidden gap-3 md:flex">
              {supporting.slice(0, 2).map((post) => (
                <div key={post.slug || post.id} className={`${dc.surface.card} pointer-events-auto flex max-w-[180px] items-center gap-3 p-3 shadow-[0_18px_48px_-24px_rgba(9,13,21,0.28)]`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="editable-label text-[0.6875rem] font-medium text-[var(--slot4-muted-text)]">{getEditableCategory(post)}</p>
                    <p className="editable-display truncate text-[0.875rem] font-medium">{post.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

/* Story rail — 2-col split showcase like the airmentors feature block:
   left = h2 + supporting copy + primary CTA; right = 2x2 mini feature cards. */
export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  void timeSections
  const items = posts.slice(0, 4)
  const label = displayLabelFor(primaryTask)

  return (
    <section className={`${dc.shell.section} ${dc.shell.sectionYSm}`}>
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
        <EditableReveal index={0}>
          <div className="lg:sticky lg:top-28">
            <span className={dc.type.eyebrow}>What you'll find</span>
            <h2 className={`mt-4 ${dc.type.sectionTitle}`}>
              A calmer way to find places worth going and references worth keeping.
            </h2>
            <p className={`mt-5 max-w-md ${dc.type.body}`}>
              Every entry in {SITE_CONFIG.name} is checked, tagged and cross-linked so the next click actually helps you.
            </p>
            <Link href={primaryRoute} className={`mt-8 ${dc.button.primary}`}>
              Explore {label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((post, i) => (
            <EditableReveal key={post.slug || post.id || i} index={i + 1}>
              <Link
                href={postHref(primaryTask, post, primaryRoute)}
                className={`group block h-full overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
              >
                <div className={`${dc.media.frame} aspect-[16/10] rounded-none border-b border-[var(--editable-border)]`}>
                  <img
                    src={getEditablePostImage(post)}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5">
                  <p className="editable-label text-[0.75rem] font-medium text-[var(--slot4-muted-text)]">{getEditableCategory(post)}</p>
                  <h3 className="editable-display mt-2 line-clamp-2 text-[1.125rem] font-semibold leading-[1.2] tracking-[-0.01em]">{post.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[var(--slot4-page-text)] transition group-hover:text-[var(--slot4-accent)]">
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Magazine split — how-it-works 3-step process band (numbered steps). */
export function EditableMagazineSplit({ primaryTask }: HomeSectionProps) {
  void primaryTask
  const steps = [
    { icon: Search, title: 'Search or browse', body: 'Pick a category or type a phrase — the directory and library share one search.' },
    { icon: Compass, title: 'Verify at a glance', body: 'Every entry has a quick-facts strip, so you can rule things in or out in seconds.' },
    { icon: Download, title: 'Save or download', body: 'Bookmark a place for later, or pull the reference document straight to your device.' },
  ]

  return (
    <section className={`${dc.shell.section} ${dc.shell.sectionYSm}`}>
      <EditableReveal index={0}>
        <div className="mx-auto max-w-3xl text-center">
          <span className={`${dc.type.eyebrow} justify-center`}>How it works</span>
          <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Three steps between question and answer.</h2>
          <p className={`mx-auto mt-5 max-w-xl ${dc.type.body}`}>
            No sign-up walls, no dark patterns. A directory built to help you decide, and a library built to help you keep going.
          </p>
        </div>
      </EditableReveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <EditableReveal key={step.title} index={i + 1}>
            <div className={`${dc.surface.soft} h-full p-7 transition duration-300 hover:-translate-y-0.5`}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--slot4-accent)]">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="editable-label text-[0.75rem] font-medium text-[var(--slot4-muted-text)]">Step {i + 1}</span>
              </div>
              <h3 className="editable-display mt-6 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className={`mt-3 text-[0.9375rem] leading-[1.6] text-[var(--slot4-muted-text)]`}>{step.body}</p>
            </div>
          </EditableReveal>
        ))}
      </div>
    </section>
  )
}

/* Time collections — dark trust band + 3-up insights grid using timeSections. */
export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections = timeSections.filter((s) => s.posts.length > 0).slice(0, 3)
  const fallback = posts.slice(0, 3)
  const items = sections.length >= 3 ? sections : sections.length ? sections : []
  const label = displayLabelFor(primaryTask)

  return (
    <section className="bg-[var(--slot4-dark-bg)] text-white">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <EditableReveal index={0}>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="editable-label inline-flex items-center gap-2 text-[0.8125rem] font-medium text-white/60 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--slot4-accent)] before:content-['']">
                Fresh this week
              </span>
              <h2 className="editable-display mt-4 text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.25rem] lg:text-[2.75rem]">
                What people are checking in {label} right now.
              </h2>
            </div>
            <Link href={primaryRoute} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[0.9375rem] font-medium text-white transition hover:border-white hover:bg-white/5">
              See all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {(items.length ? items : fallback.map((p, i) => ({ label: getEditableCategory(p), posts: [p, ...posts.slice(i + 1, i + 3)] }))).map((section, i) => {
            const s = section as { label: string; posts: SitePost[] }
            const lead = s.posts[0]
            const rest = s.posts.slice(1, 3)
            const uniqueKey = s.label ? `${s.label}-${i}` : `section-${i}`
            return (
              <EditableReveal key={uniqueKey} index={i + 1}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition duration-300 hover:border-white/25">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white/60" />
                    <span className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.12em] text-white/60">{s.label}</span>
                  </div>
                  {lead ? (
                    <Link href={postHref(primaryTask, lead, primaryRoute)} className="group block">
                      <h3 className="editable-display line-clamp-2 text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.01em] transition group-hover:text-[var(--slot4-accent-soft)]">
                        {lead.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-[1.55] text-white/70">{getEditableExcerpt(lead, 160)}</p>
                    </Link>
                  ) : null}
                  {rest.length ? (
                    <ul className="mt-auto grid gap-2 border-t border-white/10 pt-4">
                      {rest.map((post) => (
                        <li key={post.slug || post.id}>
                          <Link href={postHref(primaryTask, post, primaryRoute)} className="group inline-flex items-center gap-2 text-[0.875rem] text-white/75 transition hover:text-white">
                            <BookOpen className="h-3.5 w-3.5 shrink-0 text-white/40" />
                            <span className="line-clamp-1">{post.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* Home CTA — echo of dark hero + big display h2 + single pill CTA. */
export function EditableHomeCta() {
  return (
    <section className={`${dc.shell.section} ${dc.shell.sectionYSm}`}>
      <EditableReveal index={0}>
        <div className={`${dc.surface.dark} px-6 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24`}>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <span className="editable-label inline-flex items-center gap-2 text-[0.8125rem] font-medium text-white/60 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--slot4-accent)] before:content-['']">
                Contribute
              </span>
              <h2 className="editable-display mt-4 max-w-2xl text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem]">
                Know a place that deserves a listing? A reference worth sharing?
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.9375rem] font-medium text-[var(--slot4-dark-bg)] transition hover:bg-[var(--slot4-accent)] hover:text-white">
                Submit an entry <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[0.9375rem] font-medium text-white transition hover:border-white hover:bg-white/5">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </EditableReveal>
    </section>
  )
}
