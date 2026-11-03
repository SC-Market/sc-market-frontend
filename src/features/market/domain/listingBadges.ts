/** How long a listing shows the "New" badge after it is created. */
export const LISTING_NEW_DAYS = 3

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Whether a listing gets the "New" badge: created less than LISTING_NEW_DAYS
 * before `now`. The one rule for the market grid, the grouped grid and the
 * listing page (the page used 1 day, the grids 3). A creation time just ahead
 * of `now` (clock skew) still counts as new; an unparseable one never does.
 */
export function isListingNew(createdAt: string | Date, now: Date): boolean {
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return false
  return created > now.getTime() - LISTING_NEW_DAYS * DAY_MS
}
