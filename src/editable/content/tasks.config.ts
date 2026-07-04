import type { TaskKey } from "@/lib/site-config";

export const slot4TaskSupport = {
  article: false,
  classified: false,
  sbm: false,
  profile: false,
  pdf: true,
  listing: true,
  image: false,
} satisfies Record<TaskKey, boolean>;

export const slot4TaskNotes = {
  article: "Field-note pages and detail backlinks",
  classified: "Marketplace notice pages and detail backlinks",
  sbm: "Saved-link pages and detail backlinks",
  profile: "People pages",
  pdf: "Reference-library pages and detail backlinks",
  listing: "Local-directory pages and detail backlinks",
  image: "Photo pages and detail backlinks",
} satisfies Record<TaskKey, string>;
