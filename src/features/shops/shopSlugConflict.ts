import type {
  ShopSlugAvailabilityResponse,
  ShopSlugUnavailableReason,
} from "../../store/api/v2/market"

const REASONS: ShopSlugUnavailableReason[] = [
  "invalid",
  "reserved_word",
  "reserved_org",
  "reserved_user",
  "taken",
]

function field(value: unknown, key: string): unknown {
  return value !== null && typeof value === "object" && key in value
    ? Object.getOwnPropertyDescriptor(value, key)?.value
    : undefined
}

/**
 * The slug availability carried by a 409 from creating or renaming a shop
 * (`error.details` of the API's error body), or undefined for any other
 * error. The details are a ShopSlugAvailabilityResponse, read field by field.
 */
export function shopSlugConflictFromError(
  error: unknown,
): ShopSlugAvailabilityResponse | undefined {
  const body = field(field(error, "data"), "error")
  if (field(body, "code") !== "CONFLICT") return undefined
  const details = field(body, "details")
  const slug = field(details, "slug")
  const suggestions = field(details, "suggestions")
  if (typeof slug !== "string" || !Array.isArray(suggestions)) return undefined
  const reasonValue = field(details, "reason")
  const reservedFor = field(details, "reserved_for")
  const message = field(details, "message")
  return {
    slug,
    available: false,
    reason: REASONS.find((r) => r === reasonValue),
    reserved_for: typeof reservedFor === "string" ? reservedFor : undefined,
    message: typeof message === "string" ? message : undefined,
    suggestions: suggestions.filter((s): s is string => typeof s === "string"),
  }
}
