import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'Field notes',
    headline: 'Long-form field notes from around the network.',
    description:
      'Guides, essays and briefings written to help you decide, not just to fill a page. Every article is checked and tagged before it appears here.',
    filterLabel: 'Filter by topic',
    secondaryNote: 'Editorial pieces get room to breathe — bigger type, generous margins, no clutter.',
    chips: ['Editorial pacing', 'Topic filters', 'Long-read friendly'],
  },
  classified: {
    eyebrow: 'Marketplace',
    headline: 'Fresh offers and time-sensitive moves worth acting on.',
    description:
      'Short, practical postings kept close to the top for as long as they are relevant. When they expire, they disappear from the feed.',
    filterLabel: 'Filter by category',
    secondaryNote: 'Scan-first layout — headline, quick detail, one tap to open.',
    chips: ['Fast scan', 'Fresh weekly', 'One tap to act'],
  },
  sbm: {
    eyebrow: 'Saved links',
    headline: 'A quiet library of links and resources kept for later.',
    description:
      'Tools, references and threads worth remembering — grouped into collections so the good stuff never gets buried.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated shelves, calm metadata, no algorithmic churn.',
    chips: ['Collections', 'Reference flow', 'Kept for later'],
  },
  profile: {
    eyebrow: 'People',
    headline: 'Makers, operators and organisations behind the work.',
    description:
      'Verified profiles with the details that actually help you get in touch — links, locations and a short line about what they do.',
    filterLabel: 'Filter profile category',
    secondaryNote: 'Identity and credibility first, feed second.',
    chips: ['Identity first', 'Verified cues', 'Direct links'],
  },
  pdf: {
    eyebrow: 'Reference library',
    headline: 'Downloadable references, briefings and workbooks.',
    description:
      'Each entry is a real file you can pull straight to your device — with a preview, a page count, a file size and the source it came from.',
    filterLabel: 'Filter reference type',
    secondaryNote: 'Reference-first workspace: preview, download, keep.',
    chips: ['Downloadable', 'Preview-first', 'Tagged & versioned'],
  },
  listing: {
    eyebrow: 'Local directory',
    headline: 'Places and services worth a visit, mapped and verified.',
    description:
      'Real addresses, checked hours and honest categories. Compare at a glance, then jump straight to a phone, a map or a website.',
    filterLabel: 'Filter by category',
    secondaryNote: 'Comparison and location first — no infinite scroll traps.',
    chips: ['Directory', 'Compare', 'Verified'],
  },
  image: {
    eyebrow: 'Photos',
    headline: 'A visual feed of standout scenes and galleries.',
    description:
      'Photography kept large and calm so the image can carry the page. Every set links back to the story or place behind it.',
    filterLabel: 'Filter by set',
    secondaryNote: 'Gallery-first — the image before the text.',
    chips: ['Gallery', 'Visual-first', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
