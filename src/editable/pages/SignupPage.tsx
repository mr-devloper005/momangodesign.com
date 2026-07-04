import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Create account', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-14 md:py-20 lg:grid-cols-[0.9fr_1fr]`}>
          <EditableReveal index={0}>
            <div className={`${dc.surface.card} order-2 p-8 sm:p-10 lg:order-1`}>
              <h1 className="editable-display text-[1.5rem] font-semibold tracking-[-0.02em]">{pagesContent.auth.signup.formTitle}</h1>
              <div className="mt-6">
                <EditableLocalSignupForm />
              </div>
              <p className="mt-6 text-[0.9375rem] text-[var(--slot4-muted-text)]">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[var(--slot4-page-text)] underline underline-offset-4 hover:text-[var(--slot4-accent)]">
                  {pagesContent.auth.signup.loginCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <div className="order-1 lg:order-2">
              <span className={dc.badge.accentPill}>{pagesContent.auth.signup.badge}</span>
              <h2 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.auth.signup.title}</h2>
              <p className={`mt-5 max-w-lg ${dc.type.body}`}>{pagesContent.auth.signup.description}</p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
