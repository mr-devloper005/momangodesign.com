import type { CSSProperties } from 'react'

/*
  Coral pink palette design contract.

  Warm canvas (#FEEAC9), deep coral ink (#6E1A37 / #6E1A37 for hero),
  coral pink accent (#FD7979), pill buttons, hairline-bordered flat
  cards with medium radius. Consumed everywhere via CSS variables.
*/
export const editableRootStyle = {
  '--slot4-page-bg': '#FEEAC9',
  '--slot4-page-text': '#6E1A37',
  '--slot4-panel-bg': '#FFCDC9',
  '--slot4-surface-bg': '#FFCDC9',
  '--slot4-muted-text': 'rgba(110,26,55,0.72)',
  '--slot4-soft-muted-text': 'rgba(110,26,55,0.52)',
  '--slot4-accent': '#FD7979',
  '--slot4-accent-fill': '#FD7979',
  '--slot4-accent-soft': '#FEEAC9',
  '--slot4-on-accent': '#ffffff',
  '--slot4-dark-bg': '#6E1A37',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#FDACAC',
  '--slot4-cream': '#FEEAC9',
  '--slot4-warm': '#FFCDC9',
  '--slot4-lavender': '#FDACAC',
  '--slot4-gray': '#FEEAC9',
  '--slot4-body-gradient': 'linear-gradient(180deg, rgba(254, 234, 201, 0.96) 0%, rgba(255, 205, 201, 0.98) 36%, rgba(253, 172, 172, 1) 100%)',
  '--editable-page-bg': '#FEEAC9',
  '--editable-page-text': '#6E1A37',
  '--editable-container': '90rem',
  '--editable-border': 'rgba(110,26,55,0.10)',
  '--editable-nav-bg': '#FFCDC9',
  '--editable-nav-text': '#6E1A37',
  '--editable-nav-active': '#FD7979',
  '--editable-nav-active-text': '#ffffff',
  '--editable-cta-bg': '#FD7979',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#FFCDC9',
  '--editable-footer-bg': '#6E1A37',
  '--editable-footer-text': '#ffffff',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_1px_2px_rgba(9,13,21,0.04)]',
  shadowStrong: 'shadow-[0_18px_48px_-24px_rgba(9,13,21,0.28)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(9,13,21,0)_0%,rgba(9,13,21,0.72)_100%)]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16',
    sectionY: 'py-16 md:py-24 lg:py-32',
    sectionYSm: 'py-12 md:py-16 lg:py-20',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[160px] shrink-0 snap-start sm:w-[180px]',
  },
  type: {
    eyebrow:
      "editable-label inline-flex items-center gap-2 text-[0.8125rem] font-medium leading-none text-[var(--slot4-muted-text)] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--slot4-accent)] before:content-['']",
    heroTitle:
      'editable-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]',
    sectionTitle:
      'editable-display text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.25rem] lg:text-[2.75rem]',
    subTitle:
      'editable-display text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[1.875rem]',
    body: 'text-[1rem] leading-[1.6] text-[var(--slot4-muted-text)]',
    emphasis:
      "editable-display text-[1.125rem] font-medium leading-[1.5] tracking-[-0.01em] text-[var(--slot4-page-text)]",
  },
  surface: {
    card: `rounded-2xl border ${editablePalette.border} ${editablePalette.surfaceBg}`,
    soft: `rounded-2xl border ${editablePalette.border} ${editablePalette.creamBg}`,
    dark: `rounded-2xl ${editablePalette.darkBg} ${editablePalette.darkText}`,
    raised: `rounded-2xl border ${editablePalette.border} bg-white/70 backdrop-blur-md`,
  },
  badge: {
    pill:
      'inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-white px-3 py-1 text-[0.75rem] font-medium text-[var(--slot4-muted-text)]',
    accentPill:
      "inline-flex items-center gap-1.5 rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-[0.75rem] font-medium text-[var(--slot4-accent)] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--slot4-accent)] before:content-['']",
  },
  button: {
    primary:
      'editable-btn inline-flex items-center justify-center gap-2 rounded-full bg-[var(--editable-cta-bg)] px-6 py-3 text-[0.9375rem] font-medium tracking-[-0.005em] text-[var(--editable-cta-text)] transition duration-300 hover:bg-[var(--slot4-accent)] active:scale-[0.98]',
    secondary:
      'editable-btn inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-transparent px-6 py-3 text-[0.9375rem] font-medium tracking-[-0.005em] text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-page-text)] hover:bg-[var(--slot4-page-text)] hover:text-white active:scale-[0.98]',
    accent:
      'editable-btn inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-[0.9375rem] font-medium tracking-[-0.005em] text-[var(--slot4-on-accent)] transition duration-300 hover:brightness-105 active:scale-[0.98]',
    ghost:
      'editable-btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[0.875rem] font-medium text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-warm)] active:scale-[0.98]',
    onDarkPrimary:
      'editable-btn inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[0.9375rem] font-medium tracking-[-0.005em] text-[var(--slot4-dark-bg)] transition duration-300 hover:bg-[var(--slot4-accent)] hover:text-white active:scale-[0.98]',
  },
  media: {
    frame: `relative overflow-hidden rounded-2xl ${editablePalette.mediaBg}`,
    frameFull: `relative overflow-hidden rounded-3xl ${editablePalette.mediaBg}`,
    ratio: 'aspect-[3/4]',
    ratioWide: 'aspect-[16/9]',
    ratioSquare: 'aspect-square',
  },
  motion: {
    lift: 'transition duration-300 hover:-translate-y-0.5 hover:border-[var(--slot4-page-text)]/40',
    fade: 'transition duration-300 hover:opacity-90',
    zoom: 'transition duration-500 group-hover:scale-[1.04]',
  },
} as const

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; every section consumes those CSS variables.',
  'Keep page structure in src/editable/sections/HomeSections.tsx so the whole home experience can be redesigned in one file.',
  'Use the airmentors section rhythm: hero → showcase → how-it-works → feature grid → dark trust band → insights → CTA → footer.',
  'Buttons are always pill-shaped. Cards are hairline-bordered with medium-large radius, no drop shadow.',
  'Wrap section headers and grid items in EditableReveal with index={i} for staggered scroll-in.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
