import { slot4BrandConfig } from '@/editable/theme/brand.config'

const brand = slot4BrandConfig.siteName

export const pagesContent = {
  home: {
    metadata: {
      title: `${brand} — Local directory + reference library`,
      description: `Find verified places to visit and downloadable references worth keeping — all in one calm library on ${brand}.`,
      openGraphTitle: `${brand} — Local directory + reference library`,
      openGraphDescription: `A directory and reference-library platform built for clean discovery on ${brand}.`,
      keywords: ['local directory', 'reference library', 'downloadable guides', 'directory platform', 'verified places'],
    },
    hero: {
      badge: 'New — Local Directory',
      title: `The ${brand} directory and reference library.`,
      description: 'Verified places to visit and downloadable references worth keeping — all in one calm library.',
      primaryCta: { label: 'Browse Local Directory', href: '/listings' },
      secondaryCta: { label: 'Search everything', href: '/search' },
      searchPlaceholder: `Search ${brand}`,
      focusLabel: 'This week',
      featureCardBadge: 'Featured entry',
      featureCardTitle: 'One directory. One library. Zero clutter.',
      featureCardDescription: 'Every entry is checked, tagged and cross-linked so the next click actually helps you.',
    },
    intro: {
      badge: 'What you’ll find',
      title: 'A calmer way to find places worth going and references worth keeping.',
      paragraphs: [
        `${brand} pairs a verified local directory with a downloadable reference library. Every place and reference goes through the same short checklist before it goes live.`,
        'No infinite feeds, no dark patterns — just useful entries you can act on in seconds.',
        'Start with a category or a search, and let the cross-links do the rest.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Verified addresses, hours and contact details on every listing.',
        'Downloadable PDFs with previews, page counts and source attribution.',
        'One search across every category — directory + library.',
        'Bookmark a place or save a reference for later.',
      ],
      primaryLink: { label: 'Browse the directory', href: '/listings' },
      secondaryLink: { label: 'Open the library', href: '/pdf' },
    },
    cta: {
      badge: 'Contribute',
      title: 'Know a place that deserves a listing? A reference worth sharing?',
      description: 'Add your entry to the directory or share a reference with the library — everything gets reviewed before it goes live.',
      primaryCta: { label: 'Submit an entry', href: '/create' },
      secondaryCta: { label: 'How it works', href: '/about' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'The newest entries in this section.',
    },
  },
  about: {
    badge: 'Our story',
    title: 'A calmer, clearer way to find places and references.',
    description: `${brand} is built to make discovery feel less like a fight — a verified local directory and a downloadable reference library, both in one calm library.`,
    paragraphs: [
      'Every entry — a place, a reference, a link — goes through the same short review before it appears in the feed. No paid rankings. No filler.',
      'The point is not to be the biggest catalogue; it is to be the one you actually trust when a real question shows up.',
    ],
    values: [
      {
        title: 'Verified before it appears',
        description: 'Every listing and every reference has been checked by a human against a short, honest checklist.',
      },
      {
        title: 'Cross-linked by design',
        description: 'A place links to the references about it, and a reference links to the places it names — so you keep moving forward.',
      },
      {
        title: 'Calm on purpose',
        description: 'No feeds fighting for your attention. Wide type, gentle motion, clear entry cards. The site gets out of the way.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${brand}`,
    title: 'Tell us what to add, fix or verify.',
    description: 'Whether you spotted a stale listing, want to submit a reference, or need to reach a specific team, this form routes it through the right lane.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: `Search ${brand}`,
      description: `Search every category on ${brand} — directory, library and everything cross-linked.`,
    },
    hero: {
      badge: 'Search the library',
      title: 'Find a place, a reference, or the thread between them.',
      description: 'One search across the directory and the library — with category filters that actually help.',
      placeholder: 'Search by keyword, category, or title',
    },
    resultsTitle: 'Latest entries across the library',
  },
  create: {
    metadata: {
      title: `Submit an entry — ${brand}`,
      description: `Add a listing to the directory or share a reference with the library on ${brand}.`,
    },
    locked: {
      badge: 'Members only',
      title: 'Sign in to submit an entry.',
      description: 'Use your account to open the submission workspace and add a listing, a reference or a link.',
    },
    hero: {
      badge: 'Submission workspace',
      title: 'Add a place. Share a reference. Help the network grow.',
      description: 'Pick the entry type, fill the details, and preview before it goes to review.',
    },
    formTitle: 'Entry details',
    submitLabel: 'Send for review',
    successTitle: 'Entry sent for review.',
  },
  auth: {
    login: {
      metadataDescription: `Sign in to ${brand}.`,
      badge: 'Member access',
      title: 'Welcome back.',
      description: 'Sign in to keep your saved places, drafts and submissions in one place.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched those details. Create one, then sign in.',
      success: 'Signed in. Redirecting…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: `Create a ${brand} account.`,
      badge: 'Get started',
      title: 'Create your account.',
      description: 'Save places, keep references and submit entries — all under one calm dashboard.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related field notes',
      fallbackTitle: 'Field-note details',
    },
    listing: {
      relatedTitle: 'More from the directory',
      fallbackTitle: 'Directory entry',
    },
    image: {
      relatedTitle: 'Related photos',
      fallbackTitle: 'Photo details',
    },
    profile: {
      relatedTitle: 'Suggested field notes',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
