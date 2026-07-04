import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Sign in', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-14 md:py-20 lg:grid-cols-[1fr_0.9fr]`}>
          <EditableReveal index={0}>
            <div>
              <span className={dc.badge.accentPill}>{pagesContent.auth.login.badge}</span>
              <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.auth.login.title}</h1>
              <p className={`mt-5 max-w-lg ${dc.type.body}`}>{pagesContent.auth.login.description}</p>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <div className={`${dc.surface.card} p-8 sm:p-10`}>
              <h2 className="editable-display text-[1.5rem] font-semibold tracking-[-0.02em]">{pagesContent.auth.login.formTitle}</h2>
              <div className="mt-6">
                <EditableLocalLoginForm />
              </div>
              <p className="mt-6 text-[0.9375rem] text-[var(--slot4-muted-text)]">
                New here?{' '}
                <Link href="/signup" className="font-medium text-[var(--slot4-page-text)] underline underline-offset-4 hover:text-[var(--slot4-accent)]">
                  {pagesContent.auth.login.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
