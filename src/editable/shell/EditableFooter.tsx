'use client'

import Link from 'next/link'
import { ArrowUpRight, Twitter, Github, Linkedin } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

// Display-label overrides for renamed task categories.
// Underlying task keys and routes are unchanged.
const TASK_LABEL_OVERRIDES: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}

function labelFor(key: TaskKey, fallback: string) {
  return TASK_LABEL_OVERRIDES[key] || fallback
}

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const description =
    globalContent.footer?.description ||
    `${SITE_CONFIG.name} is a directory and reference-library platform — verified places to visit and downloadable references worth keeping.`

  return (
    <footer className="mt-24 bg-[var(--slot4-dark-bg)] text-white">
      {/* CTA strip */}
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-12 xl:px-16 lg:py-20">
          <div className="max-w-2xl">
            <span className="editable-label text-[0.8125rem] font-medium text-white/60">Join the network</span>
            <h2 className="editable-display mt-3 text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.25rem] lg:text-[2.75rem]">
              Add your place, share a reference, help the directory grow.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={session ? '/create' : '/signup'}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.9375rem] font-medium text-[var(--slot4-dark-bg)] transition hover:bg-[var(--slot4-accent)] hover:text-white"
            >
              {session ? 'Submit an entry' : 'Get started'} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[0.9375rem] font-medium text-white transition hover:border-white hover:bg-white/5"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Columns */}
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-12 xl:px-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--slot4-dark-bg)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
            </span>
            <span className="editable-display text-[1.125rem] font-semibold tracking-[-0.01em]">
              {SITE_CONFIG.name}
            </span>
          </Link>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-[1.6] text-white/70">{description}</p>
         
        </div>

        <div>
          <h3 className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white/50">
            Discover
          </h3>
          <ul className="mt-5 grid gap-3">
            {taskLinks.map((task) => (
              <li key={task.key}>
                <Link
                  href={task.route}
                  className="group inline-flex items-center gap-2 text-[0.9375rem] font-medium text-white/80 transition hover:text-white"
                >
                  {labelFor(task.key as TaskKey, task.label)}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white/50">
            Resources
          </h3>
          <ul className="mt-5 grid gap-3">
            {[
              ['About', '/about'],
              ['Contact', '/contact'],
              ['Search', '/search'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-[0.9375rem] font-medium text-white/80 transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white/50">
            Account
          </h3>
          <ul className="mt-5 grid gap-3">
            {session ? (
              <>
                <li>
                  <Link href="/create" className="text-[0.9375rem] font-medium text-white/80 transition hover:text-white">
                    Submit an entry
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-left text-[0.9375rem] font-medium text-white/80 transition hover:text-white"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="text-[0.9375rem] font-medium text-white/80 transition hover:text-white">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-[0.9375rem] font-medium text-white/80 transition hover:text-white">
                    Get started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-3 px-5 py-6 text-[0.8125rem] text-white/50 sm:flex-row sm:items-center sm:px-8 lg:px-12 xl:px-16">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <span>{globalContent.footer?.bottomNote || 'A directory + reference library built for clean discovery.'}</span>
        </div>
      </div>
    </footer>
  )
}
