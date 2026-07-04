import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-14 md:py-24`}>
          <EditableReveal index={0}>
            <div className="max-w-3xl">
              <span className={dc.badge.accentPill}>{pagesContent.about.badge}</span>
              <h1 className={`mt-6 ${dc.type.heroTitle}`}>About {SITE_CONFIG.name}</h1>
              <p className={`mt-6 max-w-2xl ${dc.type.body} text-[1.125rem]`}>{pagesContent.about.description}</p>
            </div>
          </EditableReveal>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <EditableReveal index={1}>
              <article className={`${dc.surface.card} p-8 lg:p-12`}>
                <p className="editable-label text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">Our story</p>
                <div className="mt-6 grid gap-5 text-[1.0625rem] leading-[1.7] text-[var(--slot4-page-text)]">
                  {pagesContent.about.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </EditableReveal>

            <div className="grid gap-5">
              {pagesContent.about.values.map((value, i) => (
                <EditableReveal key={value.title} index={i + 2}>
                  <div className={`${dc.surface.soft} p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--slot4-page-text)]/25`}>
                    <h2 className="editable-display text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.01em]">{value.title}</h2>
                    <p className="mt-3 text-[0.9375rem] leading-[1.55] text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
