'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, PlusCircle, LogOut } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const STATIC_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[72px] w-full max-w-[90rem] items-center gap-6 px-5 sm:px-8 lg:px-12 xl:px-16">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-page-text)] text-white transition group-hover:bg-[var(--slot4-accent)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
          </span>
          <span className="editable-display block max-w-[220px] truncate text-[1.0625rem] font-semibold leading-none tracking-[-0.01em]">
            {SITE_CONFIG.name}
          </span>
        </Link>

        
          <div className="flex items-center justify-center w-full max-w-[90rem]">
            {STATIC_LINKS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-[0.9375rem] font-medium transition ${
                    active
                      ? 'bg-[var(--slot4-warm)] text-[var(--slot4-page-text)]'
                      : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-warm)] hover:text-[var(--slot4-page-text)]'
                  }`}
                >
                {item.label}
              </Link>
            )
          })}
          </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-warm)] sm:inline-flex"
          >
            <Search className="h-4 w-4" />
          </Link>

          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-5 py-2.5 text-[0.875rem] font-medium text-white transition hover:bg-[var(--slot4-accent)] sm:inline-flex"
              >
                <PlusCircle className="h-4 w-4" /> Submit
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-[0.875rem] font-medium text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-page-text)] hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center rounded-full px-4 py-2.5 text-[0.875rem] font-medium text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-warm)] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-5 py-2.5 text-[0.875rem] font-medium text-white transition hover:bg-[var(--slot4-accent)] sm:inline-flex"
              >
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] bg-white text-[var(--slot4-page-text)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="h-px bg-[var(--editable-border)]" />

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-white px-5 py-6 sm:px-8 lg:hidden">
          <form action="/search" className="mb-5 flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder={`Search ${globalContent.site.name}`}
              className="min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
            />
          </form>
          <div className="grid gap-1">
            {[
              { label: 'Home', href: '/' },
              ...STATIC_LINKS,
              ...(session
                ? [
                    { label: 'Submit', href: '/create' },
                  ]
                : [
                    { label: 'Sign in', href: '/login' },
                    { label: 'Get started', href: '/signup' },
                  ]),
            ].map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-full px-4 py-3 text-[0.9375rem] font-medium transition ${
                    active
                      ? 'bg-[var(--slot4-warm)] text-[var(--slot4-page-text)]'
                      : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-warm)] hover:text-[var(--slot4-page-text)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
                className="mt-1 rounded-full border border-[var(--editable-border)] px-4 py-3 text-left text-[0.9375rem] font-medium text-[var(--slot4-muted-text)] hover:border-[var(--slot4-page-text)] hover:text-[var(--slot4-page-text)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
