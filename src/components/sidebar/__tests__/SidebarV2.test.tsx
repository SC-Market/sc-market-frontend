/**
 * SidebarV2 test suite.
 *
 * Covers the context-aware navigation panel behind the `nav_v2` flag:
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

// ---- Mutable mock state -----------------------------------------------------
let mockProfile: any = undefined
let mockShops: any[] = []
let mockUnreadChatCount = 0
let mockPendingOrderCount = 0
let mockShopPendingOrderCount = 0
let mockSelectedContractor: any = undefined
let mockCookies: Record<string, any> = {}
const mockSetCookie = vi.fn((name: string, value: any) => {
  mockCookies[name] = value
})
// has_permission — controllable per-test. Default: deny everything.
let mockHasPermission: (...args: any[]) => boolean = () => false

// ---- Module mocks -----------------------------------------------------------
// Override the global profileApi mock from setupTests with our mutable profile.
vi.mock("../../../features/profile/api/profileApi", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useGetUserProfileQuery: () => ({
      data: mockProfile,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    }),
  }
})

vi.mock("../../../store/api/v2/market", async () => {
  const actual: any = await vi.importActual("../../../store/api/v2/market")
  return {
    ...actual,
    useGetMyShopsQuery: () => ({ data: mockShops, isLoading: false, refetch: vi.fn() }),
  }
})

vi.mock("../../../features/contractor/api/contractorApi", async () => {
  const actual: any = await vi.importActual("../../../features/contractor/api/contractorApi")
  return {
    ...actual,
    useGetContractorBySpectrumIDQuery: () => ({ data: mockSelectedContractor }),
  }
})

vi.mock("../../../features/chats", () => ({
  useUnreadChatCount: () => mockUnreadChatCount,
}))

vi.mock("../../../features/orders/hooks/usePendingOrderCount", () => ({
  usePendingOrderCount: () => mockPendingOrderCount,
}))

vi.mock("../../../features/orders/hooks/useShopPendingOrderCount", () => ({
  useShopPendingOrderCount: () => mockShopPendingOrderCount,
}))

vi.mock("../../../hooks/layout/Drawer", async () => {
  const actual: any = await vi.importActual("../../../hooks/layout/Drawer")
  return {
    ...actual,
    useDrawerOpen: () => [true, vi.fn()],
  }
})

vi.mock("../../../hooks/layout/useBottomNavHeight", () => ({
  useBottomNavHeight: () => 0,
}))

vi.mock("../../../views/contractor/OrgRoles", () => ({
  has_permission: (...args: any[]) => mockHasPermission(...args),
}))

vi.mock("react-cookie", () => ({
  useCookies: () => [mockCookies, mockSetCookie, vi.fn()],
}))

// i18n — return the provided default string (matches project test convention).
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, def?: string | { defaultValue?: string }) => {
        if (typeof def === "object" && def !== null) return def.defaultValue ?? key
        return (def as string) || key
      },
      i18n: { language: "en", changeLanguage: vi.fn() },
    }),
  }
})

// Import AFTER mocks are declared.
import { SidebarV2 } from "../SidebarV2"
import { marketV2Api } from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"

const testTheme = createTheme({
  borderRadius: { topLevel: 0.375, image: 0.375, button: 1, input: 0.5, chip: 0.5, minimal: 0 },
} as any)

const createStore = () =>
  configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    } as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware, serviceApi.middleware),
  })

const renderSidebar = (path = "/market") =>
  render(
    <ThemeProvider theme={testTheme}>
      <Provider store={createStore()}>
        <MemoryRouter initialEntries={[path]}>
          <SidebarV2 />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>,
  )

const loggedInProfile = {
  username: "testuser",
  display_name: "Test User",
  avatar: "https://example.com/avatar.png",
  role: "user",
  contractors: [],
}

const shopWithPerms = (permissions: any = undefined) => ({
  shop_id: "shop-1",
  slug: "test-shop",
  name: "Test Shop",
  logo_url: null,
  permissions,
})

beforeEach(() => {
  vi.clearAllMocks()
  mockProfile = undefined
  mockShops = []
  mockUnreadChatCount = 0
  mockPendingOrderCount = 0
  mockShopPendingOrderCount = 0
  mockSelectedContractor = undefined
  mockCookies = {}
  mockHasPermission = () => false
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
    expect(screen.queryByText("Inventory")).not.toBeInTheDocument()
    expect(screen.queryByText("Availability")).not.toBeInTheDocument()
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
    expect(screen.getByText("Inventory")).toBeInTheDocument()
    expect(screen.getByText("Availability")).toBeInTheDocument()
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
    mockShops = [shopWithPerms()]
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
    expect(container.querySelector('a[href="/shop/test-shop/settings"]')).toBeNull()
  })

  it("shows manage_market items (Create Listing / Stock) with the permission", () => {
    mockShops = [
      shopWithPerms({ manage_market: true, manage_stock: false, manage_orders: false, can_manage: false }),
    ]
    renderSidebar("/shop/test-shop/orders")
    expect(screen.getByText("Create Listing")).toBeInTheDocument()
    expect(screen.getByText("Stock")).toBeInTheDocument()
    // can_manage still off, so no Customers / Settings
    expect(screen.queryByText("Customers")).not.toBeInTheDocument()
  })

  it("shows can_manage items (Customers / Settings) with the permission", () => {
    mockShops = [
      shopWithPerms({ manage_market: false, manage_stock: false, manage_orders: false, can_manage: true }),
    ]
    const { container } = renderSidebar("/shop/test-shop/orders")
    expect(screen.getByText("Customers")).toBeInTheDocument()
    // Shop Settings link (distinct from the always-present account /settings link).
    expect(container.querySelector('a[href="/shop/test-shop/settings"]')).not.toBeNull()
  })
})

describe("SidebarV2 — org context", () => {
  beforeEach(() => {
    mockProfile = {
      ...loggedInProfile,
      contractors: [{ spectrum_id: "TESTORG", name: "Test Org", avatar: null }],
    }
    mockSelectedContractor = { spectrum_id: "TESTORG", name: "Test Org" }
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
    mockHasPermission = (_c: any, _u: any, perm: string) => perm === "manage_org_details"
    renderSidebar("/org/TESTORG/members")
    expect(screen.getByText("Manage")).toBeInTheDocument()
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
    expect(screen.queryByRole("menuitem", { name: "Admin" })).not.toBeInTheDocument()
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
    const input = screen.getByPlaceholderText("Search navigation...")
    await user.type(input, "Messages")
    expect(screen.getByText("Messages")).toBeInTheDocument()
    // Non-matching items are filtered out.
    expect(screen.queryByText("Market")).not.toBeInTheDocument()
    expect(screen.queryByText("Contracts")).not.toBeInTheDocument()
  })

  it("shows a no-results message when nothing matches", async () => {
    const user = userEvent.setup()
    renderSidebar("/market")
    const input = screen.getByPlaceholderText("Search navigation...")
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
      shopWithPerms({ manage_market: true, manage_stock: false, manage_orders: false, can_manage: false }),
    ]
    renderSidebar("/shop/test-shop/listings/create")
    const listings = screen.getByText("Listings").closest("a") as HTMLElement
    const create = screen.getByText("Create Listing").closest("a") as HTMLElement
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
    const pinButtons = screen.getAllByLabelText("Pin")
    await user.click(pinButtons[0])
    expect(mockSetCookie).toHaveBeenCalledWith(
      "starred_nav_v2",
      expect.any(Array),
      expect.objectContaining({ path: "/" }),
    )
  })
})
