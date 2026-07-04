'use client'

import { Store, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Store, title: 'Add or update a place', body: 'Submit a new entry, correct hours or contact details, or claim an existing listing in the directory.' },
      { icon: Phone, title: 'Partnerships', body: 'Bulk onboarding, coverage requests and category expansions for organisations.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Ask for a new area or category — we can shape the directory around what you need.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Submit a field note', body: 'Pitch a long-form piece, guide or briefing that fits the library.' },
      { icon: Mail, title: 'Newsletter & partnerships', body: 'Coordinate co-publishing, cross-links and sponsored features.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with formatting, voice or the review workflow.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Photo submissions', body: 'Share sets, galleries and single frames for the visual feed.' },
      { icon: Sparkles, title: 'Licensing & use', body: 'Ask about usage rights, commercial requests and image credits.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks or coordinate a feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Suggest a reference', body: 'Recommend a file, tool or link that belongs in the library.' },
    { icon: Mail, title: 'Curation partnerships', body: 'Talk about collection projects, source lists and reference pages.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help arranging shelves or connecting boards? We can help.' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell className={dc.shell.page}>
      <main className={`${dc.shell.section} py-14 md:py-20`}>
        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <EditableReveal index={0}>
            <div>
              <span className={dc.badge.accentPill}>{pagesContent.contact.eyebrow}</span>
              <h1 className={`mt-6 ${dc.type.heroTitle}`}>{pagesContent.contact.title}</h1>
              <p className={`mt-5 max-w-2xl ${dc.type.body}`}>{pagesContent.contact.description}</p>
              <div className="mt-10 grid gap-4">
                {lanes.map((lane, i) => (
                  <EditableReveal key={lane.title} index={i + 1}>
                    <div className={`${dc.surface.soft} p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--slot4-page-text)]/25`}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--slot4-accent)]">
                        <lane.icon className="h-4 w-4" />
                      </span>
                      <h2 className="editable-display mt-4 text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.01em]">{lane.title}</h2>
                      <p className={`mt-2 text-[0.9375rem] leading-[1.55] ${dc.type.body}`}>{lane.body}</p>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className={`${dc.surface.card} p-7`}>
              <h2 className="editable-display text-[1.5rem] font-semibold tracking-[-0.02em]">{pagesContent.contact.formTitle}</h2>
              <div className="mt-6">
                <EditableContactLeadForm />
              </div>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
