import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Airmentors-derived task surfaces.

  One shared visual language for every task (off-white surface, navy ink,
  electric-blue accent, Inter Tight display). Only kicker/note copy varies
  per task — display labels use the renamed pair:
    listing → "Local Directory"
    pdf     → "Reference Library"
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Inter Tight', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const BODY_FONT = "'Inter Tight', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#FEEAC9',
  surface: '#FFCDC9',
  raised: '#FDACAC',
  text: '#6E1A37',
  muted: 'rgba(110,26,55,0.72)',
  line: 'rgba(110,26,55,0.10)',
  accent: '#FD7979',
  accentSoft: '#FEEAC9',
  onAccent: '#ffffff',
  glow: 'rgba(253,121,121,0.10)',
  radius: '1rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: {
    ...base,
    kicker: 'Field notes',
    note: 'Long-form guides and briefings from around the network.',
  },
  listing: {
    ...base,
    kicker: 'Local directory',
    note: 'Places and services worth a visit, mapped and verified.',
  },
  classified: {
    ...base,
    kicker: 'Marketplace',
    note: 'Fresh offers and moves ready to act on.',
  },
  image: {
    ...base,
    kicker: 'Photos',
    note: 'A visual feed of standout scenes and galleries.',
  },
  sbm: {
    ...base,
    kicker: 'Saved links',
    note: 'A quiet library of links and resources kept for later.',
  },
  pdf: {
    ...base,
    kicker: 'Reference library',
    note: 'Downloadable references, briefings and workbooks.',
  },
  profile: {
    ...base,
    kicker: 'People',
    note: 'Makers, operators and organisations behind the work.',
  },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
