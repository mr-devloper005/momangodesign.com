'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, Send, Sparkles, Store } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}
const displayLabelFor = (task: TaskKey, fallback: string) => TASK_DISPLAY[task] || fallback

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Store,
  classified: Sparkles,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: Sparkles,
}

const fieldClass =
  'w-full rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3 text-[0.9375rem] text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-page-text)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]
  const activeLabel = activeTask ? displayLabelFor(activeTask.key as TaskKey, activeTask.label) : 'entry'

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className={dc.shell.page}>
          <section className={`${dc.shell.section} py-14 md:py-20`}>
            <EditableReveal index={0}>
              <div className={`${dc.surface.card} grid gap-10 p-8 sm:p-12 md:grid-cols-[0.8fr_1.2fr]`}>
                <div className="flex min-h-64 items-center justify-center rounded-2xl bg-[var(--slot4-dark-bg)] text-white">
                  <Lock className="h-16 w-16 opacity-80" />
                </div>
                <div className="self-center">
                  <span className={dc.badge.accentPill}>{pagesContent.create.locked.badge}</span>
                  <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.create.locked.title}</h1>
                  <p className={`mt-5 max-w-xl ${dc.type.body}`}>{pagesContent.create.locked.description}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/login" className={dc.button.primary}>
                      Sign in <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link href="/signup" className={dc.button.secondary}>
                      Get started
                    </Link>
                  </div>
                </div>
              </div>
            </EditableReveal>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-14 md:py-20`}>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <EditableReveal index={0}>
              <aside>
                <span className={dc.badge.accentPill}>{pagesContent.create.hero.badge}</span>
                <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.create.hero.title}</h1>
                <p className={`mt-5 max-w-xl ${dc.type.body}`}>{pagesContent.create.hero.description}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {enabledTasks.map((item) => {
                    const Icon = taskIcon[item.key] || FileText
                    const active = item.key === task
                    const itemLabel = displayLabelFor(item.key as TaskKey, item.label)
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTask(item.key)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          active
                            ? 'border-transparent bg-[var(--slot4-dark-bg)] text-white'
                            : 'border-[var(--editable-border)] bg-white text-[var(--slot4-page-text)] hover:-translate-y-0.5 hover:border-[var(--slot4-page-text)]/25'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-[var(--slot4-accent)]'}`} />
                        <span className="editable-display mt-3 block text-[0.9375rem] font-semibold tracking-[-0.01em]">{itemLabel}</span>
                        <span className={`mt-1 block text-[0.8125rem] leading-[1.4] ${active ? 'text-white/70' : 'text-[var(--slot4-muted-text)]'}`}>
                          {item.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </aside>
            </EditableReveal>

            <EditableReveal index={1}>
              <form onSubmit={submit} className={`${dc.surface.card} p-6 sm:p-8`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[var(--slot4-muted-text)]">
                      New entry · {activeLabel}
                    </p>
                    <h2 className="editable-display mt-1 text-[1.5rem] font-semibold tracking-[-0.02em] sm:text-[1.75rem]">
                      {pagesContent.create.formTitle}
                    </h2>
                  </div>
                  <span className="rounded-full border border-[var(--editable-border)] bg-white px-3 py-1 text-[0.75rem] font-medium text-[var(--slot4-muted-text)]">
                    {session.name}
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
                    <input className={fieldClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Website or source URL" />
                  </div>
                  <input className={fieldClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="Featured image URL" />
                  <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" required />
                  <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Main content — details, notes or description" required />
                </div>

                {created ? (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--slot4-accent)]/30 bg-[var(--slot4-accent-soft)] p-4 text-[var(--slot4-page-text)]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--slot4-accent)]" />
                    <div>
                      <p className="editable-display text-[0.9375rem] font-semibold tracking-[-0.01em]">{pagesContent.create.successTitle}</p>
                      <p className="mt-1 text-[0.875rem] text-[var(--slot4-muted-text)]">{created.title}</p>
                    </div>
                  </div>
                ) : null}

                <button type="submit" className={`mt-6 w-full ${dc.button.primary}`}>
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </button>
              </form>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
