/**
 * SidebarV2 test suite.
 *
 * Covers the context-aware navigation panel (the site's only sidebar):
 *   - browse context (logged out / logged in)
 *   - shop context + permission gating
 *   - org context + has_permission gating
 *   - admin context + admin-only switcher entry
 *   - badges (unread chats / pending orders)
 *   - navigation search filtering
 *   - active-highlight logic incl. the parent-vs-child edge case
 *
 * All external hooks are mocked at module level via mutable variables so each
 * test can control profile / shops / counts / permissions. Location is driven
 * by MemoryRouter's initialEntries (real useLocation), which is what the
 * component's context inference reads.
 */
import "../../../features/market/v2/__tests__/setup"
import React from "react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { configureStore } from "@reduxjs/toolkit"
import type { UserProfileState } from "../../../hooks/login/UserProfile"
import type { ShopResponse } from "../../../features/shops/api/shopsApi"
import type { Contractor } from "../../../features/contractor/domain/types"
import type { has_permission as HasPermission } from "../../../features/contractor/domain/permissions"
import type { SidebarConfigItem } from "../../../features/contractor/api/contractorV2Api"
import { withShopContext } from "../shopContextState"
import {
  CustomDomainContext,
  type CustomDomain,
} from "../../../hooks/contractor/CustomDomain"

// ---- Mutable mock state -----------------------------------------------------
let mockProfile: UserProfileState | undefined = undefined
let mockShops: ShopResponse[] = []
/** GET /api/auth/session answer (undefined = in flight). */
let mockSessionCheck:
  | "authenticated"
  | "anonymous"
  | "unsupported"
  | undefined = "authenticated"
/** skip option of each useGetMyShopsQuery call. */
const shopsMineSkips: (boolean | undefined)[] = []
let mockUnreadChatCount = 0
let mockPendingOrderCount = 0
let mockShopPendingOrderCount = 0
let mockSelectedContractor: Contractor | undefined = undefined
let mockCookies: Record<string, unknown> = {}
const mockSetCookie = vi.fn((name: string, value: unknown) => {
  mockCookies[name] = value
})
// has_permission — controllable per-test. Default: deny everything.
let mockHasPermission: typeof HasPermission = () => false
/** false = a white-label org domain (Help & Guides links out). */
let mockOfficialSite = true
let mockWhiteLabel: { hidden: Set<string>; customTabs: SidebarConfigItem[] } = {
  hidden: new Set(),
  customTabs: [],
}
vi.mock("../../../features/contractor/hooks/useWhiteLabelSidebar", () => ({
  useWhiteLabelSidebar: () => mockWhiteLabel,
}))

// ---- Module mocks -----------------------------------------------------------
vi.mock("../../../features/help/links", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  isOfficialSite: () => mockOfficialSite,
}))
// Override the global profileApi mock from setupTests with our mutable profile.
vi.mock("../../../features/profile/api/profileApi", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useAuthSessionCheckQuery: () => ({ data: mockSessionCheck }),
    useGetUserProfileQuery: () => ({
      data: mockProfile,
      isSuccess: mockProfile !== undefined,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    }),
  }
})

vi.mock("../../../features/shops/api/shopsApi", async () => {
  const actual = await vi.importActual<
    typeof import("../../../features/shops/api/shopsApi")
  >("../../../features/shops/api/shopsApi")
  return {
    ...actual,
    useGetMyShopsQuery: (_arg?: void, opts?: { skip?: boolean }) => {
      shopsMineSkips.push(opts?.skip)
      return querySuccess<typeof actual.shopsApi.endpoints.getMyShops>(
        mockShops,
      )
    },
  }
})

vi.mock("../../../features/contractor/api/contractorApi", async () => {
  const actual = await vi.importActual<
    typeof import("../../../features/contractor/api/contractorApi")
  >("../../../features/contractor/api/contractorApi")
  return {
    ...actual,
    useGetContractorBySpectrumIDQuery: () => ({ data: mockSelectedContractor }),
  }
})

vi.mock("../../../features/chats/hooks/UnreadChatCount", () => ({
  useUnreadChatCount: () => mockUnreadChatCount,
}))

vi.mock("../../../features/orders/hooks/usePendingOrderCount", () => ({
  usePendingOrderCount: () => mockPendingOrderCount,
}))

vi.mock("../../../features/orders/hooks/useShopPendingOrderCount", () => ({
  useShopPendingOrderCount: () => mockShopPendingOrderCount,
}))

vi.mock("../../../hooks/layout/Drawer", async () => {
  const actual = await vi.importActual<
    typeof import("../../../hooks/layout/Drawer")
  >("../../../hooks/layout/Drawer")
  return {
    ...actual,
    useDrawerOpen: () => [true, vi.fn()],
  }
})

vi.mock("../../../hooks/layout/useBottomNavHeight", () => ({
  useBottomNavHeight: () => 0,
}))

vi.mock("../../../views/contractor/OrgRoles", () => ({
  has_permission: (...args: Parameters<typeof HasPermission>) =>
    mockHasPermission(...args),
}))
// The Manage entry's rules (manageTabs) use the domain permission check.
vi.mock(
  "../../../features/contractor/domain/permissions",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../features/contractor/domain/permissions")
    >()),
    has_permission: (...args: Parameters<typeof HasPermission>) =>
      mockHasPermission(...args),
  }),
)

vi.mock("react-cookie", () => ({
  useCookies: () => [mockCookies, mockSetCookie, vi.fn()],
}))

// English catalog t() (src/test/mocks/reactI18next).
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

// Import AFTER mocks are declared.
import { SidebarV2 } from "../SidebarV2"
import { shopsApi } from "../../../features/shops/api/shopsApi"
import { contractorsApi } from "../../../features/contractor/api/contractorApi"
import { querySuccess } from "../../../__tests__/rtkQueryMocks"

const testTheme = createTheme({
  borderRadius: {
    topLevel: 0.375,
    image: 0.375,
    button: 1,
    input: 0.5,
    chip: 0.5,
    minimal: 0,
  },
})

const createStore = () =>
  configureStore({
    reducer: {
      [shopsApi.reducerPath]: shopsApi.reducer,
      [contractorsApi.reducerPath]: contractorsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        shopsApi.middleware,
        contractorsApi.middleware,
      ),
  })

const renderSidebar = (
  path: string | { pathname: string; state: unknown } = "/market",
) =>
  render(
    <ThemeProvider theme={testTheme}>
      <Provider store={createStore()}>
        <MemoryRouter initialEntries={[path]}>
          <SidebarV2 />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>,
  )

const loggedInProfile: UserProfileState = {
  username: "testuser",
  display_name: "Test User",
  discord_username: "testuser#0001",
  avatar: "https://example.com/avatar.png",
  role: "user",
  contractors: [],
  balance: 0,
  profile_description: "",
  settings: { discord_order_share: false, discord_public: false },
  market_order_template: "",
  locale: "en",
}

const shopWithPerms = (
  permissions: ShopResponse["permissions"] = undefined,
): ShopResponse => ({
  shop_id: "shop-1",
  slug: "test-shop",
  name: "Test Shop",
  description: "",
  banner: null,
  logo: null,
  owner_user_id: "user-1",
  is_org_owned: false,
  owner_contractor_spectrum_id: null,
  supported_languages: ["en"],
  tags: [],
  accepts_custom_orders: true,
  market_order_template: "",
  default_pickup_method: null,
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  banner_url: null,
  official_server_id: null,
  discord_thread_channel_id: null,
  badge_ids: [],
  logo_url: null,
  permissions,
})

beforeEach(() => {
  vi.clearAllMocks()
  mockProfile = undefined
  mockShops = []
  mockSessionCheck = "authenticated"
  mockUnreadChatCount = 0
  mockPendingOrderCount = 0
  mockShopPendingOrderCount = 0
  mockSelectedContractor = undefined
  mockCookies = {}
  mockHasPermission = () => false
  mockOfficialSite = true
  mockWhiteLabel = { hidden: new Set(), customTabs: [] }
  // Default to desktop viewport.
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

describe("SidebarV2 — browse context (logged out)", () => {
  it("renders the marketplace items", () => {
    renderSidebar("/market")
    expect(screen.getByText("Market")).toBeInTheDocument()
    expect(screen.getByText("Services")).toBeInTheDocument()
    expect(screen.getByText("Contracts")).toBeInTheDocument()
    expect(screen.getByText("Buy Orders")).toBeInTheDocument()
  })

  it("does NOT render logged-in-only personal items", () => {
    renderSidebar("/market")
    expect(screen.queryByText("My Orders")).not.toBeInTheDocument()
    expect(screen.queryByText("Messages")).not.toBeInTheDocument()
    expect(screen.queryByText("My Stock")).not.toBeInTheDocument()
    expect(screen.queryByText("Availability")).not.toBeInTheDocument()
  })

  it("shows a Sign in CTA linking to login instead of the context switcher", () => {
    renderSidebar("/market")
    const signIn = screen.getByRole("link", { name: "Sign in" })
    expect(signIn).toBeInTheDocument()
    expect(signIn).toHaveAttribute("href", "/login")
    // The context switcher is logged-in only.
    expect(
      screen.queryByRole("button", { name: "Switch context" }),
    ).not.toBeInTheDocument()
  })

  it("does NOT render the bottom Settings link when logged out", () => {
    renderSidebar("/market")
    expect(screen.queryByText("Settings")).not.toBeInTheDocument()
  })

  it("renders the bottom Help & Guides link for logged-out visitors", () => {
    renderSidebar("/market")
    expect(screen.getByRole("link", { name: "Help & Guides" })).toHaveAttribute(
      "href",
      "/guides",
    )
  })

  it("highlights Help & Guides on guide and about pages", () => {
    renderSidebar("/guides/buying/buy-an-item")
    expect(screen.getByRole("link", { name: "Help & Guides" })).toHaveClass(
      "Mui-selected",
    )
  })

  it("links Help & Guides out to the official site on a white-label domain", () => {
    mockOfficialSite = false
    renderSidebar("/market")
    const help = screen.getByRole("link", { name: "Help & Guides" })
    expect(help).toHaveAttribute("href", "https://sc-market.space/guides")
    expect(help).toHaveAttribute("target", "_blank")
  })
})

describe("SidebarV2 — white-label sidebar settings", () => {
  const customTab = (
    custom_label: string,
    custom_path: string,
    sort_order: number,
  ): SidebarConfigItem => ({
    standard_tab_key: null,
    custom_label,
    custom_path,
    custom_icon: "link",
    is_external: custom_path.startsWith("https://"),
    enabled: true,
    sort_order,
  })

  it("hides the tabs the org turned off, including Recruiting and Organizations", () => {
    mockWhiteLabel = {
      hidden: new Set(["market", "contracts", "recruiting", "contractors"]),
      customTabs: [],
    }
    renderSidebar("/market/services")
    expect(screen.queryByText("Market")).not.toBeInTheDocument()
    expect(screen.queryByText("Contracts")).not.toBeInTheDocument()
    expect(screen.queryByText("Recruiting")).not.toBeInTheDocument()
    expect(screen.queryByText("Organizations")).not.toBeInTheDocument()
    expect(screen.getByText("Services")).toBeInTheDocument()
    expect(screen.getByText("Shops")).toBeInTheDocument()
  })

  it("shows every tab when nothing is hidden", () => {
    renderSidebar("/market")
    expect(screen.getByText("Recruiting")).toBeInTheDocument()
    expect(screen.getByText("Organizations")).toBeInTheDocument()
  })

  it("adds the org's custom tabs; external ones open in a new tab", () => {
    mockWhiteLabel = {
      hidden: new Set(),
      customTabs: [
        customTab("Staff Portal", "https://staff.example.com", 12),
        customTab("Our Fleet", "/fleet", 13),
      ],
    }
    renderSidebar("/market")
    const staff = screen.getByRole("link", { name: /Staff Portal/ })
    expect(staff).toHaveAttribute("href", "https://staff.example.com")
    expect(staff).toHaveAttribute("target", "_blank")
    const fleet = screen.getByRole("link", { name: /Our Fleet/ })
    expect(fleet).toHaveAttribute("href", "/fleet")
    expect(fleet).not.toHaveAttribute("target")
  })
})

describe("SidebarV2 — on an org's white-label host", () => {
  const sidebarOn = (domain: CustomDomain) => (
    <ThemeProvider theme={testTheme}>
      <Provider store={store}>
        <CustomDomainContext.Provider value={domain}>
          <MemoryRouter initialEntries={["/contractor/MEDRUNNER"]}>
            <SidebarV2 />
          </MemoryRouter>
        </CustomDomainContext.Provider>
      </Provider>
    </ThemeProvider>
  )
  let store: ReturnType<typeof createStore>
  beforeEach(() => {
    store = createStore()
    mockOfficialSite = false
  })
  const staffPortal: SidebarConfigItem = {
    standard_tab_key: null,
    custom_label: "Staff Portal",
    custom_path: "https://staff.example.com",
    custom_icon: "link",
    is_external: true,
    enabled: true,
    sort_order: 12,
  }

  it("heads the sidebar with the org's brand, not SC Market's", () => {
    render(sidebarOn({ isCustomDomain: true, customOrg: "MEDRUNNER" }))
    const brand = screen.getByTestId("sidebar-org-brand")
    expect(brand).toHaveTextContent("MEDRUNNER")
    expect(brand).toHaveTextContent("Storefront on SC Market")
    expect(screen.queryByText("SC Market")).not.toBeInTheDocument()
  })

  it("brings in the org's brand and links once the domain answer is in", () => {
    // First visit: the host is known to be an org's, its answer isn't yet.
    const { rerender } = render(
      sidebarOn({ isCustomDomain: true, customOrg: undefined }),
    )
    expect(screen.queryByTestId("sidebar-org-brand")).not.toBeInTheDocument()
    mockWhiteLabel = {
      hidden: new Set(["contracts"]),
      customTabs: [staffPortal],
    }
    rerender(sidebarOn({ isCustomDomain: true, customOrg: "MEDRUNNER" }))
    expect(screen.getByTestId("sidebar-org-brand")).toHaveTextContent(
      "MEDRUNNER",
    )
    expect(screen.getByRole("link", { name: /Staff Portal/ })).toHaveAttribute(
      "href",
      "https://staff.example.com",
    )
    expect(screen.queryByText("Contracts")).not.toBeInTheDocument()
    expect(screen.getByText("Market")).toBeInTheDocument()
  })
})

describe("SidebarV2 — browse context (logged in)", () => {
  beforeEach(() => {
    mockProfile = { ...loggedInProfile }
  })

  it("renders the personal items when logged in", () => {
    renderSidebar("/market")
    expect(screen.getByText("My Orders")).toBeInTheDocument()
    expect(screen.getByText("Messages")).toBeInTheDocument()
    expect(screen.getByText("My Stock")).toBeInTheDocument()
    expect(screen.getByText("Availability")).toBeInTheDocument()
  })

  it("renders Settings, then Help & Guides, in the bottom block", () => {
    renderSidebar("/market")
    const settings = screen.getByRole("link", { name: "Settings" })
    const help = screen.getByRole("link", { name: "Help & Guides" })
    expect(help).toHaveAttribute("href", "/guides")
    expect(
      settings.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("renders the Game Data section (browse mode)", () => {
    renderSidebar("/market")
    expect(screen.getByText("Game Data")).toBeInTheDocument()
    expect(screen.getByText("Missions")).toBeInTheDocument()
    expect(screen.getByText("Crafting")).toBeInTheDocument()
    expect(screen.getByText("Wiki")).toBeInTheDocument()
  })
})

describe("SidebarV2 — shop context", () => {
  beforeEach(() => {
    mockProfile = { ...loggedInProfile }
  })

  it("renders the core shop items when a shop is selected", () => {
    // The owner (GET /shops/mine sets every flag for the owning user)
    mockShops = [
      shopWithPerms({
        manage_market: true,
        manage_stock: true,
        manage_orders: true,
        can_manage: true,
      }),
    ]
    renderSidebar("/shop/test-shop/orders")
    expect(screen.getByText("Shop Page")).toBeInTheDocument()
    expect(screen.getByText("Orders")).toBeInTheDocument()
    expect(screen.getByText("Listings")).toBeInTheDocument()
    expect(screen.getByText("Services")).toBeInTheDocument()
  })

  it("hides permission-gated items without permissions", () => {
    mockShops = [shopWithPerms(undefined)]
    const { container } = renderSidebar("/shop/test-shop/orders")
    expect(screen.queryByText("Create Listing")).not.toBeInTheDocument()
    expect(screen.queryByText("Stock")).not.toBeInTheDocument()
    expect(screen.queryByText("Customers")).not.toBeInTheDocument()
    // Shop Settings link is gated (the always-present account Settings uses /settings).
    expect(
      container.querySelector('a[href="/shop/test-shop/settings"]'),
    ).toBeNull()
  })

  it("shows manage_market items (Create Listing / Stock) with the permission", () => {
    // Manage Market: /shops/mine reports it as can_manage too
    mockShops = [
      shopWithPerms({
        manage_market: true,
        manage_stock: false,
        manage_orders: false,
        can_manage: true,
      }),
    ]
    renderSidebar("/shop/test-shop/orders")
    expect(screen.getByText("Create Listing")).toBeInTheDocument()
    expect(screen.getByText("Stock")).toBeInTheDocument()
    // Services need Manage Orders
    expect(screen.queryByText("Services")).not.toBeInTheDocument()
  })

  // Regression: the sidebar switched to "Browsing" on a listing's page after
  // creating or editing it from the shop.
  it("keeps the shop's context on a listing page reached from that shop", () => {
    mockShops = [shopWithPerms()]
    renderSidebar({
      pathname: "/market/abcd1234--gun",
      state: withShopContext("test-shop"),
    })
    expect(screen.getByText("Shop Page")).toBeInTheDocument()
    expect(screen.queryByText("Browsing")).not.toBeInTheDocument()
  })

  it("browses on a listing page reached any other way", () => {
    mockShops = [shopWithPerms()]
    renderSidebar("/market/abcd1234--gun")
    expect(screen.queryByText("Shop Page")).not.toBeInTheDocument()
  })

  it("shows can_manage items (Customers / Settings) with the permission", () => {
    mockShops = [
      shopWithPerms({
        manage_market: false,
        manage_stock: false,
        manage_orders: false,
        can_manage: true,
      }),
    ]
    const { container } = renderSidebar("/shop/test-shop/orders")
    expect(screen.getByText("Customers")).toBeInTheDocument()
    // Shop Settings link (distinct from the always-present account /settings link).
    expect(
      container.querySelector('a[href="/shop/test-shop/settings"]'),
    ).not.toBeNull()
  })
})

describe("SidebarV2 — org context", () => {
  beforeEach(() => {
    mockProfile = {
      ...loggedInProfile,
      contractors: [
        {
          spectrum_id: "TESTORG",
          name: "Test Org",
          avatar: "",
          rating: {
            avg_rating: 0,
            rating_count: 0,
            total_rating: 0,
            streak: 0,
          },
          role: "member",
          roles: [],
        },
      ],
    }
    mockSelectedContractor = {
      contractor_id: "00000000-0000-4000-8000-000000000001",
      kind: "organization",
      spectrum_id: "TESTORG",
      name: "Test Org",
      avatar: "",
      banner: "",
      description: "",
      fields: [],
      size: 1,
      rating: { avg_rating: 0, rating_count: 0, total_rating: 0, streak: 0 },
      market_order_template: "",
    }
  })

  it("renders the core org items", () => {
    renderSidebar("/org/TESTORG/members")
    expect(screen.getByText("Org Page")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Members")).toBeInTheDocument()
  })

  it("hides Manage when the user has no manage permission", () => {
    mockHasPermission = () => false
    renderSidebar("/org/TESTORG/members")
    expect(screen.queryByText("Manage")).not.toBeInTheDocument()
  })

  it("shows the single Manage entry when the user has a manage permission", () => {
    // Grant manage_org_details only — the single Manage entry should appear.
    mockHasPermission = (_contractor, _user, permission_name) =>
      permission_name === "manage_org_details"
    renderSidebar("/org/TESTORG/members")
    expect(screen.getByText("Manage")).toBeInTheDocument()
  })

  it("hides Manage with only Manage Blocklist (no manage tab needs it)", () => {
    mockHasPermission = (_contractor, _user, permission_name) =>
      permission_name === "manage_blocklist"
    renderSidebar("/org/TESTORG/members")
    expect(screen.queryByText("Manage")).not.toBeInTheDocument()
  })

  it("shows Manage with only Manage Webhooks (the Discord tab)", () => {
    mockHasPermission = (_contractor, _user, permission_name) =>
      permission_name === "manage_webhooks"
    renderSidebar("/org/TESTORG/members")
    expect(screen.getByText("Manage")).toBeInTheDocument()
  })

  it("hides Manage with only Manage Theme on an org without white-label", () => {
    mockHasPermission = (_contractor, _user, permission_name) =>
      permission_name === "manage_theme"
    renderSidebar("/org/TESTORG/members")
    expect(screen.queryByText("Manage")).not.toBeInTheDocument()
  })
})

describe("SidebarV2 — admin context", () => {
  it("renders admin items in the admin context", () => {
    mockProfile = { ...loggedInProfile, role: "admin" }
    renderSidebar("/admin/orders")
    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(screen.getByText("Moderation")).toBeInTheDocument()
    expect(screen.getByText("Feature Flags")).toBeInTheDocument()
  })

  it("gives every admin item its own icon", () => {
    mockProfile = { ...loggedInProfile, role: "admin" }
    renderSidebar("/admin/orders")
    const labels = [
      "Orders",
      "Users",
      "Market",
      "Expire Listings",
      "Premium",
      "Alerts",
      "Moderation",
      "Supplier Dashboard",
      "Supplier Roster",
      "Requisitions",
      "Feature Flags",
      "Game Data Import",
      "Attributes",
      "Game Item Attributes",
      "Import Monitoring",
      "Identity",
      "Test Accounts",
      "Audit Logs",
      "Notification Test",
      "Two-factor",
    ]
    const icons = labels.map((label) => {
      const item = screen.getByText(label).closest("a")
      const icon = item
        ?.querySelector("svg[data-testid]")
        ?.getAttribute("data-testid")
      expect(icon, label).toBeTruthy()
      return icon
    })
    expect(new Set(icons).size).toBe(labels.length)
  })

  it("exposes the Admin switcher entry only when role is admin", async () => {
    const user = userEvent.setup()
    mockProfile = { ...loggedInProfile, role: "admin" }
    renderSidebar("/market")
    await user.click(screen.getByRole("button", { name: "Switch context" }))
    expect(screen.getByRole("menuitem", { name: "Admin" })).toBeInTheDocument()
  })

  it("hides the Admin switcher entry for non-admins", async () => {
    const user = userEvent.setup()
    mockProfile = { ...loggedInProfile, role: "user" }
    renderSidebar("/market")
    await user.click(screen.getByRole("button", { name: "Switch context" }))
    expect(
      screen.queryByRole("menuitem", { name: "Admin" }),
    ).not.toBeInTheDocument()
  })
})

describe("SidebarV2 — badges", () => {
  beforeEach(() => {
    mockProfile = { ...loggedInProfile }
  })

  it("shows the unread chat count on Messages", () => {
    mockUnreadChatCount = 7
    renderSidebar("/market")
    const messages = screen.getByText("Messages").closest("a") as HTMLElement
    expect(within(messages).getByText("7")).toBeInTheDocument()
  })

  it("shows the pending order count on My Orders", () => {
    mockPendingOrderCount = 3
    renderSidebar("/market")
    const myOrders = screen.getByText("My Orders").closest("a") as HTMLElement
    expect(within(myOrders).getByText("3")).toBeInTheDocument()
  })

  it("renders no badge when counts are zero", () => {
    mockUnreadChatCount = 0
    mockPendingOrderCount = 0
    renderSidebar("/market")
    const messages = screen.getByText("Messages").closest("a") as HTMLElement
    // No numeric chip inside the Messages row.
    expect(within(messages).queryByText("0")).not.toBeInTheDocument()
  })
})

describe("SidebarV2 — search filtering", () => {
  beforeEach(() => {
    mockProfile = { ...loggedInProfile }
  })

  it("filters visible nav items to matches when typing", async () => {
    const user = userEvent.setup()
    renderSidebar("/market")
    const input = screen.getByPlaceholderText("Search navigation")
    await user.type(input, "Messages")
    expect(screen.getByText("Messages")).toBeInTheDocument()
    // Non-matching items are filtered out.
    expect(screen.queryByText("Market")).not.toBeInTheDocument()
    expect(screen.queryByText("Contracts")).not.toBeInTheDocument()
  })

  it("shows a no-results message when nothing matches", async () => {
    const user = userEvent.setup()
    renderSidebar("/market")
    const input = screen.getByPlaceholderText("Search navigation")
    await user.type(input, "zzznomatch")
    expect(screen.getByText("No matching pages")).toBeInTheDocument()
  })
})

describe("SidebarV2 — active highlight", () => {
  beforeEach(() => {
    mockProfile = { ...loggedInProfile }
  })

  it("selects the item matching the current location", () => {
    renderSidebar("/market")
    const market = screen.getByText("Market").closest("a") as HTMLElement
    expect(market.className).toContain("Mui-selected")
  })

  it("does not highlight a parent route when a more-specific child is active", () => {
    // On the create page: Listings (parent) must NOT be selected; Create Listing (child) must be.
    mockShops = [
      shopWithPerms({
        manage_market: true,
        manage_stock: false,
        manage_orders: false,
        can_manage: true,
      }),
    ]
    renderSidebar("/shop/test-shop/listings/create")
    const listings = screen.getByText("Listings").closest("a") as HTMLElement
    const create = screen
      .getByText("Create Listing")
      .closest("a") as HTMLElement
    expect(listings.className).not.toContain("Mui-selected")
    expect(create.className).toContain("Mui-selected")
  })
})

describe("SidebarV2 — pinning", () => {
  beforeEach(() => {
    mockProfile = { ...loggedInProfile }
  })

  it("renders a Pinned section for starred destinations", () => {
    mockCookies = { starred_nav_v2: ["/market"] }
    renderSidebar("/market")
    expect(screen.getByText("Pinned")).toBeInTheDocument()
    // The pinned item + the context item both render "Market".
    expect(screen.getAllByText("Market").length).toBeGreaterThan(1)
  })

  it("writes the starred cookie when a pin toggle is clicked", async () => {
    const user = userEvent.setup()
    renderSidebar("/market")
    // Each nav item has a pin IconButton (tooltip "Pin"); click the first.
    // They mount once the page is idle (a static icon stands in until then).
    const pinButtons = await screen.findAllByLabelText(
      "Pin",
      {},
      { timeout: 4000 },
    )
    await user.click(pinButtons[0])
    expect(mockSetCookie).toHaveBeenCalledWith(
      "starred_nav_v2",
      expect.any(Array),
      expect.objectContaining({ path: "/" }),
    )
  })
})

describe("SidebarV2 — GET /api/v2/shops/mine gating", () => {
  beforeEach(() => {
    shopsMineSkips.length = 0
  })

  it("skips shops/mine for anonymous visitors", () => {
    mockSessionCheck = "anonymous"
    mockProfile = undefined
    renderSidebar("/market")
    expect(shopsMineSkips.length).toBeGreaterThan(0)
    expect(shopsMineSkips.every((skip) => skip === true)).toBe(true)
  })

  it("skips shops/mine while the session check is in flight, even with a cached profile", () => {
    mockSessionCheck = undefined
    mockProfile = { username: "tester", role: "user" } as UserProfileState
    renderSidebar("/market")
    expect(shopsMineSkips.every((skip) => skip === true)).toBe(true)
  })

  it("requests shops/mine once the session check confirms the session", () => {
    mockSessionCheck = "authenticated"
    mockProfile = { username: "tester", role: "user" } as UserProfileState
    renderSidebar("/market")
    expect(shopsMineSkips.at(-1)).toBe(false)
  })
})
