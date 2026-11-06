import type { WidgetScopeKind } from "./types"

export const SCOPE_LABEL_KEYS: Record<
  WidgetScopeKind,
  { key: string; default: string }
> = {
  me: { key: "dashboard.scope.me", default: "You" },
  current_context: {
    key: "dashboard.scope.currentContext",
    default: "Current context",
  },
  all_orgs: { key: "dashboard.scope.allOrgs", default: "All organizations" },
  all_shops: { key: "dashboard.scope.allShops", default: "All shops" },
  specific_org: {
    key: "dashboard.scope.specificOrg",
    default: "A specific organization",
  },
  specific_shop: {
    key: "dashboard.scope.specificShop",
    default: "A specific shop",
  },
}

// On a shared org/shop dashboard, personal and aggregate bindings are meaningless
// (the dashboard belongs to the owner, not the viewer). Only "current_context"
// (which resolves to the owner) and explicit specific_* pins are allowed.
export const ORG_SHARED_SCOPES: WidgetScopeKind[] = [
  "current_context",
  "specific_org",
  "specific_shop",
]

export const SHOP_SHARED_SCOPES: WidgetScopeKind[] = [
  "current_context",
  "specific_shop",
]

/** The scopes in `allowed` that the owner allowlist permits (all if none). */
export function filterScopes(
  allowed: WidgetScopeKind[],
  allowlist: WidgetScopeKind[] | null,
): WidgetScopeKind[] {
  return allowlist ? allowed.filter((k) => allowlist.includes(k)) : allowed
}
