/**
 * Shops show each management page only to roles that may use it, and block
 * direct navigation to the rest, by one rule (canOpenShopSection, mirroring
 * the backend's canManageShop / canManageShopStock / canManageShopOrders /
 * services checks). Pinned per role: owner, manager (Manage Market),
 * stock-only, orders-only, plain member, and an outsider.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import type { TFunction } from "i18next"
import "../../../util/i18n"
import type { ShopResponse } from "../../../features/shops/api/shopsApi"
import {
  canOpenShopSection,
  type ShopSection,
} from "../../../features/shops/domain/shopPermissions"
import { shopNavItems } from "../../sidebar/sidebarNavItems"
import { PageReadyProvider } from "../../metadata/PageReady"

const { state } = vi.hoisted(() => ({
  state: { mine: [] as ShopResponse[], shop: undefined as unknown },
}))

vi.mock("../../../features/shops/api/shopsApi", () => ({
  useGetMyShopsQuery: () => ({ data: state.mine, isLoading: false }),
  useGetShopQuery: () => ({
    data: state.shop,
    isLoading: false,
    isError: false,
  }),
}))
// The real ContainerGrid pulls in the drawer, footer and their providers.
vi.mock("../../layout/ContainerGrid", () => ({
  ContainerGrid: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}))

import { ShopContextFromRoute } from "../ShopContextFromRoute"
import { ManageListingsTabBar } from "../../../features/market/components/ManageListingsTabBar"

type Role =
  | "owner"
  | "manager"
  | "stockOnly"
  | "ordersOnly"
  | "member"
  | "outsider"

const PERMS: Record<Role, ShopResponse["permissions"]> = {
  owner: {
    can_manage: true,
    manage_market: true,
    manage_stock: true,
    manage_orders: true,
  },
  manager: {
    can_manage: true,
    manage_market: true,
    manage_stock: false,
    manage_orders: false,
  },
  stockOnly: {
    can_manage: false,
    manage_market: false,
    manage_stock: true,
    manage_orders: false,
  },
  ordersOnly: {
    can_manage: false,
    manage_market: false,
    manage_stock: false,
    manage_orders: true,
  },
  member: {
    can_manage: false,
    manage_market: false,
    manage_stock: false,
    manage_orders: false,
  },
  // Someone else's shop: GET /shops/{slug} carries no permissions.
  outsider: undefined,
}

function shop(role: Role): ShopResponse {
  return {
    shop_id: "shop-1",
    slug: "fang-shop",
    name: "Fang Shop",
    description: "",
    banner: null,
    logo: null,
    owner_user_id: role === "owner" ? "owner-1" : null,
    is_org_owned: role !== "owner",
    owner_contractor_spectrum_id: role === "owner" ? null : "FANGORG",
    supported_languages: ["en"],
    tags: [],
    accepts_custom_orders: true,
    market_order_template: "",
    default_pickup_method: null,
    status: "active",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    banner_url: null,
    logo_url: null,
    official_server_id: null,
    discord_thread_channel_id: null,
    badge_ids: [],
    permissions: PERMS[role],
  } as ShopResponse
}

function asRole(role: Role) {
  state.shop = shop(role)
  // /shops/mine lists the user's own shops and their orgs' shops only.
  state.mine = role === "outsider" ? [] : [shop(role)]
}

const SECTIONS: ShopSection[] = [
  "listings",
  "create",
  "stock",
  "orders",
  "dashboard",
  "services",
  "customers",
  "settings",
]

/** Who may open each section, per role (the matrix in shopPermissions.ts). */
const ALLOWED: Record<Role, ShopSection[]> = {
  owner: SECTIONS,
  manager: [
    "listings",
    "create",
    "stock",
    "orders",
    "dashboard",
    "customers",
    "settings",
  ],
  stockOnly: ["listings", "stock", "dashboard"],
  ordersOnly: ["listings", "stock", "orders", "dashboard", "services"],
  member: ["listings", "stock", "dashboard"],
  outsider: [],
}

const ROLES = Object.keys(ALLOWED) as Role[]

const PATHS: Record<ShopSection, string> = {
  listings: "listings",
  create: "listings/create",
  stock: "stock",
  orders: "orders",
  dashboard: "dashboard",
  services: "services",
  customers: "customers",
  settings: "settings",
}

const NO_ACCESS_TITLES: Record<ShopSection, string> = {
  listings: "You don't have access to this shop's listings",
  create: "You don't have permission to create listings for this shop",
  stock: "You don't have access to this shop's stock",
  orders: "You don't have permission to handle this shop's orders",
  dashboard: "You don't have access to this shop's dashboard",
  services: "You don't have permission to manage this shop's services",
  customers: "You don't have permission to view this shop's customers",
  settings: "You don't have permission to manage this shop's settings",
}

function renderAt(section: ShopSection, page?: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[`/shop/fang-shop/${PATHS[section]}`]}>
      <PageReadyProvider>
        <Routes>
          <Route path="/shop/:shopSlug" element={<ShopContextFromRoute />}>
            {SECTIONS.map((s) => (
              <Route
                key={s}
                path={PATHS[s]}
                element={page ?? <p>{`page:${s}`}</p>}
              />
            ))}
          </Route>
          <Route path="/dashboard/shops" element={<p>My Shops</p>} />
        </Routes>
      </PageReadyProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  state.mine = []
  state.shop = undefined
})

describe("shop section access per role", () => {
  it.each(ROLES)("%s: canOpenShopSection matches the matrix", (role) => {
    const s = shop(role)
    expect(SECTIONS.filter((sec) => canOpenShopSection(s, sec))).toEqual(
      ALLOWED[role],
    )
  })
})

describe("shop sidebar per role", () => {
  const t = ((_key: string, fallback: string) => fallback) as TFunction
  const labels = (role: Role, dashboard = false) =>
    shopNavItems(t, shop(role), dashboard, 0).map((i) => i.label)

  it.each<[Role, string[]]>([
    [
      "owner",
      [
        "Shop Page",
        "Orders",
        "Listings",
        "Services",
        "Create Listing",
        "Stock",
        "Customers",
        "Settings",
      ],
    ],
    [
      "manager",
      [
        "Shop Page",
        "Orders",
        "Listings",
        "Create Listing",
        "Stock",
        "Customers",
        "Settings",
      ],
    ],
    ["stockOnly", ["Shop Page", "Listings", "Stock"]],
    ["ordersOnly", ["Shop Page", "Orders", "Listings", "Services", "Stock"]],
    ["member", ["Shop Page", "Listings", "Stock"]],
    ["outsider", ["Shop Page"]],
  ])("%s sees only what they may open", (role, expected) => {
    expect(labels(role)).toEqual(expected)
  })

  it("adds the shared dashboard for every member when it is on", () => {
    expect(labels("member", true)).toEqual([
      "Shop Page",
      "Dashboard",
      "Listings",
      "Stock",
    ])
    expect(labels("outsider", true)).toEqual(["Shop Page"])
  })
})

describe("direct navigation to a shop page per role", () => {
  for (const role of ROLES.filter((r) => r !== "outsider")) {
    for (const section of SECTIONS) {
      const allowed = ALLOWED[role].includes(section)
      it(`${role} → ${section}: ${allowed ? "opens" : "no access"}`, () => {
        asRole(role)
        renderAt(section)
        if (allowed) {
          expect(screen.getByText(`page:${section}`)).toBeInTheDocument()
        } else {
          expect(screen.queryByText(`page:${section}`)).toBeNull()
          expect(
            screen.getByRole("heading", { name: NO_ACCESS_TITLES[section] }),
          ).toBeInTheDocument()
          expect(
            screen.getByRole("link", { name: "Go to Fang Shop" }),
          ).toHaveAttribute("href", "/shops/fang-shop")
        }
      })
    }
  }

  it.each(SECTIONS)("outsider → %s: back to My Shops", (section) => {
    asRole("outsider")
    renderAt(section)
    expect(screen.queryByText(`page:${section}`)).toBeNull()
    expect(screen.getByText("My Shops")).toBeInTheDocument()
  })
})

describe("manage tab bar per role", () => {
  const tabs = () => screen.getAllByRole("tab").map((tab) => tab.textContent)

  it.each<[Role, string[]]>([
    ["owner", ["Manage Listings", "Stock", "Manage Services"]],
    ["manager", ["Manage Listings", "Stock"]],
    ["stockOnly", ["Manage Listings", "Stock"]],
    ["ordersOnly", ["Manage Listings", "Stock", "Manage Services"]],
    ["member", ["Manage Listings", "Stock"]],
  ])("%s gets only the tabs they may open", (role, expected) => {
    asRole(role)
    renderAt("listings", <ManageListingsTabBar title="Manage Listings" />)
    expect(tabs()).toEqual(expected)
  })
})
