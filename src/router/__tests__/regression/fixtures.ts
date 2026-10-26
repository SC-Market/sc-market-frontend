/**
 * Fixture data and a fake API for the route regression harness.
 *
 * Every request the app makes goes through `globalThis.fetch` (RTK Query's
 * fetchBaseQuery) — the harness replaces it with `createFakeApi()`, which
 * answers a handful of endpoints the route gates need (profile, the fixture
 * org, the fixture shop) and returns 404 for everything else. Nothing leaves
 * the process.
 */
import type { UserProfileState } from "../../../hooks/login/UserProfile"
import type {
  Contractor,
  ContractorRole,
} from "../../../features/contractor/domain/types"
import type {
  ShopPublicResponse,
  ShopResponse,
} from "../../../store/api/v2/market"

/** Param values used to turn route patterns into concrete URLs. */
export const FIXTURE = {
  orgId: "TESTORG",
  shopSlug: "test-shop",
  username: "fixture_user",
  chatId: "chat-1",
} as const

/** Generic value per route param name. */
export const PARAM_VALUES: Record<string, string> = {
  id: "fixture-id",
  contractor_id: FIXTURE.orgId,
  shopSlug: FIXTURE.shopSlug,
  slug: "fixture-slug",
  chat_id: FIXTURE.chatId,
  username: FIXTURE.username,
  tab: "fixture-tab",
  service_id: "service-1",
  post_id: "post-1",
  contract_id: "contract-1",
  delivery_id: "delivery-1",
  invite_id: "invite-1",
  token: "token-1",
  listingId: "listing-1",
  name: "fixture-name",
  wishlist_id: "wishlist-1",
  resource_id: "resource-1",
  flagName: "fixture_flag",
  category: "buying",
}

/** Per-pattern overrides where a specific param value is more meaningful. */
export const PATTERN_PARAM_OVERRIDES: Record<string, Record<string, string>> = {
  "/contractor/:id/:tab": { id: FIXTURE.orgId, tab: "about" },
  "/contractor/:id": { id: FIXTURE.orgId },
  "/shops/:slug/:tab": { slug: FIXTURE.shopSlug, tab: "about" },
  "/shops/:slug": { slug: FIXTURE.shopSlug },
  "/user/:username/:tab": { tab: "store" },
  "/profile/:tab": { tab: "store" },
  "/market/create/:tab": { tab: "unique" },
  // A real guide, so the suite renders content rather than the 404 body.
  "/guides/:category/:slug": { category: "buying", slug: "buy-an-item" },
}

const OWNER_ROLE: ContractorRole = {
  contractor_id: "contractor-1",
  name: "Owner",
  position: 0,
  role_id: "role-owner",
  manage_roles: true,
  manage_orders: true,
  kick_members: true,
  manage_invites: true,
  manage_org_details: true,
  manage_stock: true,
  manage_market: true,
  manage_recruiting: true,
  manage_webhooks: true,
  manage_blocklist: true,
  claim_orders: true,
  manage_theme: true,
}

const RATING = { avg_rating: 0, rating_count: 0, total_rating: 0, streak: 0 }

export const fixtureContractor: Contractor = {
  contractor_id: "00000000-0000-4000-8000-000000000001",
  kind: "organization",
  avatar: "",
  banner: "",
  rating: RATING,
  size: 1,
  name: "Test Org",
  description: "Fixture org",
  fields: [],
  spectrum_id: FIXTURE.orgId,
  roles: [OWNER_ROLE],
  default_role: OWNER_ROLE.role_id,
  owner_role: OWNER_ROLE.role_id,
  balance: 0,
  market_order_template: "",
  archived: false,
}

export type SessionKind =
  /** Logged out: GET /api/profile is 401. */
  | "anonymous"
  /** Site admin, RSI-verified, onboarded, owner of TESTORG and test-shop. */
  | "admin"
  /** Regular (non-admin) user, otherwise like admin. */
  | "user"
  /** Logged in but RSI account not linked yet. */
  | "unverified"
  /** Logged in, verified, but onboarding not completed. */
  | "not-onboarded"

export function fixtureProfile(
  kind: Exclude<SessionKind, "anonymous">,
): UserProfileState {
  return {
    username: FIXTURE.username,
    display_name: "Fixture User",
    discord_username: "fixture",
    avatar: "",
    role: kind === "admin" ? "admin" : "user",
    contractors: [
      {
        avatar: "",
        name: fixtureContractor.name,
        spectrum_id: FIXTURE.orgId,
        rating: RATING,
        roles: [OWNER_ROLE.role_id],
        role: OWNER_ROLE.name,
      },
    ],
    balance: 0,
    rsi_confirmed: kind !== "unverified",
    profile_description: "",
    settings: { discord_order_share: false, discord_public: false },
    market_order_template: "",
    locale: "en",
    onboarding_completed_at:
      kind === "not-onboarded" ? null : "2024-01-01T00:00:00.000Z",
  }
}

const SHOP_BASE = {
  shop_id: "shop-1",
  slug: FIXTURE.shopSlug,
  name: "Test Shop",
  description: "Fixture shop",
  supported_languages: ["en"],
  tags: [],
  accepts_custom_orders: true,
  status: "active",
  created_at: "2024-01-01T00:00:00.000Z",
  badge_ids: [],
}

export const fixtureShop: ShopResponse = {
  ...SHOP_BASE,
  banner: null,
  logo: null,
  owner_user_id: "user-1",
  is_org_owned: false,
  owner_contractor_spectrum_id: null,
  market_order_template: "",
  default_pickup_method: null,
  updated_at: "2024-01-01T00:00:00.000Z",
  banner_url: null,
  official_server_id: null,
  discord_thread_channel_id: null,
  permissions: {
    manage_orders: true,
    manage_stock: true,
    manage_market: true,
    can_manage: true,
  },
  logo_url: null,
}

export const fixtureShopPublic: ShopPublicResponse = {
  ...SHOP_BASE,
  banner_url: null,
  logo_url: null,
  rating: null,
  rating_count: 0,
}

export interface FakeApiRequest {
  method: string
  /** pathname + search, without the backend origin */
  path: string
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/**
 * Build a fetch replacement for one test. Known endpoints get fixture
 * responses; everything else is a 404 with the API's error shape.
 */
export function createFakeApi(session: SessionKind) {
  const requests: FakeApiRequest[] = []
  const fetchImpl = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const request = input instanceof Request ? input : null
    const url = new URL(
      request ? request.url : String(input),
      "http://localhost",
    )
    const method = (request?.method ?? init?.method ?? "GET").toUpperCase()
    const path = url.pathname + url.search
    requests.push({ method, path })

    if (method === "GET") {
      if (url.pathname === "/api/profile") {
        return session === "anonymous"
          ? json(
              { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
              401,
            )
          : json(fixtureProfile(session))
      }
      if (url.pathname === `/api/contractors/${FIXTURE.orgId}`) {
        return json({ data: fixtureContractor })
      }
      if (url.pathname === "/api/v2/shops/mine") {
        return session === "anonymous"
          ? json(
              { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
              401,
            )
          : json([fixtureShop])
      }
      if (url.pathname === `/api/v2/shops/${FIXTURE.shopSlug}`) {
        return json(fixtureShopPublic)
      }
    }
    return json({ error: { code: "NOT_FOUND", message: "Not found" } }, 404)
  }
  return { fetchImpl, requests }
}
