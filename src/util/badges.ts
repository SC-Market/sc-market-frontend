import { Rating } from "../datatypes/Contractor"

// Badge ID constants
export const BADGE_RATING_99_9 = "rating_99_9"
export const BADGE_RATING_99 = "rating_99"
export const BADGE_RATING_95 = "rating_95"
export const BADGE_RATING_90 = "rating_90"
export const BADGE_STREAK_PRO = "streak_pro"
export const BADGE_STREAK_GOLD = "streak_gold"
export const BADGE_STREAK_SILVER = "streak_silver"
export const BADGE_STREAK_COPPER = "streak_copper"
export const BADGE_VOLUME_PRO = "volume_pro"
export const BADGE_VOLUME_GOLD = "volume_gold"
export const BADGE_VOLUME_SILVER = "volume_silver"
export const BADGE_VOLUME_COPPER = "volume_copper"
export const BADGE_POWER_SELLER = "power_seller"
export const BADGE_BUSY_SELLER = "busy_seller"
export const BADGE_ACTIVE_SELLER = "active_seller"
export const BADGE_SPEED_PRO = "speed_pro"
export const BADGE_SPEED_GOLD = "speed_gold"
export const BADGE_SPEED_SILVER = "speed_silver"
export const BADGE_SPEED_COPPER = "speed_copper"
export const BADGE_CONSISTENCY_PRO = "consistency_pro"
export const BADGE_CONSISTENCY_GOLD = "consistency_gold"
export const BADGE_CONSISTENCY_SILVER = "consistency_silver"
export const BADGE_CONSISTENCY_COPPER = "consistency_copper"
export const BADGE_EARLY_ADOPTER = "early_adopter"
export const BADGE_RESPONSIVE = "responsive"

// Badge priority order (highest to lowest)
// Only the highest tier within each category is considered
const BADGE_PRIORITY = [
  // Rating badges (highest priority)
  BADGE_RATING_99_9,
  BADGE_RATING_99,
  BADGE_RATING_95,
  BADGE_RATING_90,
  // Volume badges
  BADGE_VOLUME_PRO,
  BADGE_VOLUME_GOLD,
  BADGE_VOLUME_SILVER,
  BADGE_VOLUME_COPPER,
  // Streak badges
  BADGE_STREAK_PRO,
  BADGE_STREAK_GOLD,
  BADGE_STREAK_SILVER,
  BADGE_STREAK_COPPER,
  // Speed badges
  BADGE_SPEED_PRO,
  BADGE_SPEED_GOLD,
  BADGE_SPEED_SILVER,
  BADGE_SPEED_COPPER,
  // Consistency badges
  BADGE_CONSISTENCY_PRO,
  BADGE_CONSISTENCY_GOLD,
  BADGE_CONSISTENCY_SILVER,
  BADGE_CONSISTENCY_COPPER,
  // Activity badges (only highest applicable)
  BADGE_POWER_SELLER,
  BADGE_BUSY_SELLER,
  BADGE_ACTIVE_SELLER,
  // Responsive badge
  BADGE_RESPONSIVE,
  // Early adopter (lowest priority)
  BADGE_EARLY_ADOPTER,
]

/**
 * Prioritizes badges and optionally limits the number returned
 * @param badge_ids Array of badge IDs to prioritize
 * @param limit Optional limit (default: unlimited). Use 3 for market listings.
 * @returns Prioritized array of badge IDs
 */
export function prioritizeBadges(
  badge_ids: string[],
  limit?: number,
): string[] {
  // Filter to only include valid badge IDs
  const availableBadges = badge_ids.filter((id) => BADGE_PRIORITY.includes(id))

  // Sort by priority order
  const prioritized = availableBadges.sort((a, b) => {
    const indexA = BADGE_PRIORITY.indexOf(a)
    const indexB = BADGE_PRIORITY.indexOf(b)
    return indexA - indexB
  })

  // Handle activity badges - only include highest applicable
  const activityBadges = [
    BADGE_POWER_SELLER,
    BADGE_BUSY_SELLER,
    BADGE_ACTIVE_SELLER,
  ]
  const hasActivityBadge = prioritized.some((id) => activityBadges.includes(id))
  if (hasActivityBadge) {
    // Find highest activity badge
    const highestActivity = prioritized.find((id) =>
      activityBadges.includes(id),
    )
    // Remove lower priority activity badges
    for (let i = prioritized.length - 1; i >= 0; i--) {
      if (
        activityBadges.includes(prioritized[i]) &&
        prioritized[i] !== highestActivity
      ) {
        prioritized.splice(i, 1)
      }
    }
  }

  // Apply limit if specified
  return limit ? prioritized.slice(0, limit) : prioritized
}

/**
 * Calculates badges from rating data (fallback when badge_ids not available)
 * @param rating Rating data object
 * @returns Array of badge IDs
 */
export function calculateBadgesFromRating(rating: Rating): string[] {
  const badges: string[] = []

  // Rating badges - only highest tier applies (using 0-5 scale: 4.995 = 99.9%, 4.95 = 99%, 4.75 = 95%, 4.5 = 90%)
  if (rating.avg_rating >= 4.995 && (rating.total_orders || 0) >= 25) {
    badges.push(BADGE_RATING_99_9)
  } else if (rating.avg_rating >= 4.95 && (rating.total_orders || 0) >= 25) {
    badges.push(BADGE_RATING_99)
  } else if (rating.avg_rating >= 4.75 && (rating.total_orders || 0) >= 25) {
    badges.push(BADGE_RATING_95)
  } else if (rating.avg_rating >= 4.5 && (rating.total_orders || 0) >= 25) {
    badges.push(BADGE_RATING_90)
  }

  // Streak badges - only highest tier applies
  if (rating.streak >= 50) {
    badges.push(BADGE_STREAK_PRO)
  } else if (rating.streak >= 25) {
    badges.push(BADGE_STREAK_GOLD)
  } else if (rating.streak >= 15) {
    badges.push(BADGE_STREAK_SILVER)
  } else if (rating.streak >= 5) {
    badges.push(BADGE_STREAK_COPPER)
  }

  // Responsive badge
  if (
    (rating.total_assignments || 0) >= 10 &&
    (rating.response_rate || 0) >= 90
  ) {
    badges.push(BADGE_RESPONSIVE)
  }

  return badges
}
