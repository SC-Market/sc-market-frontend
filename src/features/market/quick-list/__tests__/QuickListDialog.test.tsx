import "../../v2/__tests__/setup"
import React from "react"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { ShopResponse } from "../../../../store/api/v2/market"

const h = vi.hoisted(() => ({
  session: {
    status: "authenticated",
    profile: { username: "mira", rsi_confirmed: true },
  } as {
    status: string
    profile?: { username: string; rsi_confirmed?: boolean }
  },
  shops: [] as unknown[],
  stats: undefined as unknown,
  create: vi.fn(),
  remove: vi.fn(),
  alert: vi.fn(),
  nextItem: { id: "item-2", name: "Karna Rifle", type: "Ranged Weapon" },
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../../hooks/login/useSession", () => ({
  useSession: () => h.session,
  useIsAuthenticated: () => h.session.status === "authenticated",
}))
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => h.alert,
}))
vi.mock("../../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => false,
}))
vi.mock("../../../../store/api/v2/market", () => ({
  useGetMyShopsQuery: () => ({
    data: h.shops,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useQuickCreateShopMutation: () => [vi.fn(), { isLoading: false }],
  useGetPriceStatsQuery: (_: unknown, opts?: { skip?: boolean }) => ({
    currentData: opts?.skip ? undefined : h.stats,
  }),
  useCreateListingMutation: () => [h.create, { isLoading: false }],
  useDeleteListingMutation: () => [h.remove, { isLoading: false }],
}))
vi.mock("../../../../store/api/v2/market-overrides", () => ({
  useUploadImageMutation: () => [vi.fn()],
}))
vi.mock("../../components/GameItemSearchAutocomplete", () => ({
  GameItemSearchAutocomplete: (props: {
    label?: string
    errorText?: string
    onChange: (
      name: string | null,
      type: string | null,
      id: string | null,
    ) => void
  }) => (
    <>
      <input
        data-testid="item-search"
        aria-label={props.label}
        onChange={() =>
          props.onChange(h.nextItem.name, h.nextItem.type, h.nextItem.id)
        }
      />
      {props.errorText && <p>{props.errorText}</p>}
    </>
  ),
}))
vi.mock("../../components/stock/LocationSelector", () => ({
  LocationSelector: (props: {
    label?: string
    onChange: (id: string | null) => void
  }) => (
    <input
      aria-label={props.label}
      onChange={(e) => props.onChange(e.target.value)}
    />
  ),
}))
vi.mock("../../../../components/modal/SelectPhotosArea", () => ({
  SelectPhotosArea: () => null,
}))
vi.mock("../../../../components/market/BulkDiscountTierEditor", () => ({
  BulkDiscountTierEditor: () => null,
}))
vi.mock("../../../help/components/FirstUseHint", () => ({
  FirstUseHint: (props: { title: string }) => <aside>{props.title}</aside>,
}))
vi.mock("../../../help/components/HelpLink", () => ({
  HelpLink: (props: { children?: React.ReactNode }) => (
    <a href="/guides">{props.children}</a>
  ),
}))

import { QuickListDialog } from "../QuickListDialog"
import { setSidebarShopContext } from "../../../../components/sidebar/shopContextState"
import { LAST_QUICK_LIST_SHOP_KEY } from "../../domain/quickList"

const theme = createTheme({
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
  borderRadius: {
    topLevel: 0.375,
    image: 0.375,
    button: 1,
    input: 0.5,
    chip: 0.5,
    minimal: 0,
  },
  palette: { outline: { main: "#e0e0e0" } },
} as Parameters<typeof createTheme>[0])

const shop = (slug: string, name: string, canManage = true, org = false) =>
  ({
    shop_id: `id-${slug}`,
    slug,
    name,
    status: "active",
    is_org_owned: org,
    logo_url: null,
    permissions: {
      can_manage: canManage,
      manage_market: canManage,
      manage_stock: false,
      manage_orders: false,
    },
  }) as unknown as ShopResponse

const RIFLE = {
  id: "item-1",
  name: "Arrowhead Sniper Rifle",
  type: "Ranged Weapon",
}

function renderDialog(
  props: { item?: typeof RIFLE | null; path?: string } = {},
) {
  const onClose = vi.fn()
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter
        initialEntries={[props.path ?? "/market/aggregate/arrowhead"]}
      >
        <QuickListDialog
          open
          onClose={onClose}
          item={props.item === undefined ? RIFLE : props.item}
        />
      </MemoryRouter>
    </ThemeProvider>,
  )
  return { onClose }
}

const request = (call = 0) => h.create.mock.calls[call][0].createListingRequest

beforeEach(() => {
  h.session = {
    status: "authenticated",
    profile: { username: "mira", rsi_confirmed: true },
  }
  h.shops = [
    shop("miras-shop", "Mira's Shop"),
    shop("ardent", "Ardent Freight Co.", true, true),
    shop("view-only", "View Only Org", false, true),
  ]
  h.stats = {
    current: { lowest_ask: 12500, median_ask: 14000, ask_count: 6 },
    trend_30d: { median_30d: null },
  }
  h.create.mockReset()
  h.create.mockReturnValue({
    unwrap: () => Promise.resolve({ listing_id: "listing-1" }),
  })
  h.remove.mockReset()
  h.remove.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  h.alert.mockReset()
  localStorage.clear()
  setSidebarShopContext(null)
})

describe("QuickListDialog", () => {
  it("lists the page's item at the market price in the first shop, then closes", async () => {
    const { onClose } = renderDialog()

    expect(
      screen.getByDisplayValue("Arrowhead Sniper Rifle"),
    ).toBeInTheDocument()
    expect(screen.getByText("Picked from the item page.")).toBeInTheDocument()
    expect(
      screen.getByText("Market: low 12,500 · median 14,000 · 6 listings"),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByLabelText(/Price per unit/)).toHaveValue("14,000"),
    )

    fireEvent.click(screen.getByRole("button", { name: "Publish" }))

    await waitFor(() => expect(h.create).toHaveBeenCalledTimes(1))
    expect(request()).toMatchObject({
      title: "Arrowhead Sniper Rifle",
      game_item_id: "item-1",
      pricing_mode: "unified",
      base_price: 14000,
      lots: [{ quantity: 1, variant_attributes: {} }],
      shop_id: "id-miras-shop",
      status: "active",
      sale_type: "fixed",
    })
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(JSON.parse(localStorage.getItem(LAST_QUICK_LIST_SHOP_KEY)!)).toEqual(
      { mira: "id-miras-shop" },
    )
  })

  it("publishes nothing without a price, and says why", async () => {
    h.stats = undefined
    renderDialog()
    expect(
      screen.getByText("No market price yet: you set the first one."),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Publish" }))

    expect(
      await screen.findByText(
        "Couldn't publish: Base price must be greater than 0",
      ),
    ).toBeInTheDocument()
    expect(h.create).not.toHaveBeenCalled()
  })

  it("Publish & list another keeps the dialog open, counts, and clears the item; Undo archives it", async () => {
    const { onClose } = renderDialog()
    await waitFor(() =>
      expect(screen.getByLabelText(/Price per unit/)).toHaveValue("14,000"),
    )
    fireEvent.click(screen.getByRole("button", { name: "One more" }))

    fireEvent.click(
      screen.getByRole("button", { name: "Publish & list another" }),
    )

    expect(
      await screen.findByText(
        /Listed: Arrowhead Sniper Rifle · 14,000 aUEC × 2\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/1 listed so far\./)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    // The item search is back, empty, for the next one
    expect(screen.getByTestId("item-search")).toBeInTheDocument()
    expect(
      screen.queryByDisplayValue("Arrowhead Sniper Rifle"),
    ).not.toBeInTheDocument()

    // The next item
    h.create.mockReturnValue({
      unwrap: () => Promise.resolve({ listing_id: "listing-2" }),
    })
    h.stats = {
      current: { lowest_ask: 9000, median_ask: null, ask_count: 1 },
      trend_30d: { median_30d: null },
    }
    fireEvent.change(screen.getByTestId("item-search"), {
      target: { value: "Karna" },
    })
    await waitFor(() =>
      expect(screen.getByLabelText(/Price per unit/)).toHaveValue("9,000"),
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Publish & list another" }),
    )
    expect(await screen.findByText(/2 listed so far\./)).toBeInTheDocument()
    expect(request(1)).toMatchObject({
      title: "Karna Rifle",
      game_item_id: "item-2",
      base_price: 9000,
      shop_id: "id-miras-shop",
    })

    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    await waitFor(() =>
      expect(h.remove).toHaveBeenCalledWith({ id: "listing-2" }),
    )
    await waitFor(() =>
      expect(screen.queryByText(/listed so far/)).not.toBeInTheDocument(),
    )
  })

  it("offers only the shops the user can list in, and lists in the one picked", async () => {
    renderDialog()
    const picker = screen.getByRole("combobox", { name: /Selling as/ })
    expect(picker).toHaveTextContent("Mira's Shop")

    fireEvent.mouseDown(picker)
    const options = within(screen.getByRole("listbox")).getAllByRole("option")
    expect(options.map((o) => o.textContent)).toEqual([
      "Mira's Shop/miras-shop",
      "Ardent Freight Co./ardent",
    ])
    fireEvent.click(options[1])

    await waitFor(() =>
      expect(screen.getByLabelText(/Price per unit/)).toHaveValue("14,000"),
    )
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    await waitFor(() => expect(h.create).toHaveBeenCalled())
    expect(request().shop_id).toBe("id-ardent")
    // An org shop: visibility is sent
    expect(request().visibility).toBe("public")
    expect(JSON.parse(localStorage.getItem(LAST_QUICK_LIST_SHOP_KEY)!)).toEqual(
      { mira: "id-ardent" },
    )
  })

  it("starts on the last shop used, unless the page or the sidebar is in a shop", () => {
    localStorage.setItem(
      LAST_QUICK_LIST_SHOP_KEY,
      JSON.stringify({ mira: "id-ardent", someone: "id-miras-shop" }),
    )
    renderDialog()
    expect(
      screen.getByRole("combobox", { name: /Selling as/ }),
    ).toHaveTextContent("Ardent Freight Co.")
  })

  it("follows the sidebar's shop context", () => {
    localStorage.setItem(
      LAST_QUICK_LIST_SHOP_KEY,
      JSON.stringify({ mira: "id-miras-shop" }),
    )
    act(() => setSidebarShopContext("ardent"))
    renderDialog()
    expect(
      screen.getByRole("combobox", { name: /Selling as/ }),
    ).toHaveTextContent("Ardent Freight Co.")
  })

  it("follows the page's shop context over the sidebar's", () => {
    act(() => setSidebarShopContext("miras-shop"))
    renderDialog({ path: "/shop/ardent/listings" })
    expect(
      screen.getByRole("combobox", { name: /Selling as/ }),
    ).toHaveTextContent("Ardent Freight Co.")
  })

  it("splits stock into batches by location and quality", async () => {
    renderDialog()
    await waitFor(() =>
      expect(screen.getByLabelText(/Price per unit/)).toHaveValue("14,000"),
    )
    fireEvent.click(screen.getByRole("button", { name: "One more" }))
    fireEvent.click(
      screen.getByRole("button", { name: "By location / quality" }),
    )

    // The quantity moved into the first batch
    const first = screen.getByRole("group", { name: "Batch 1" })
    expect(within(first).getByLabelText("Qty")).toHaveValue("2")
    fireEvent.change(within(first).getByLabelText("Location"), {
      target: { value: "port-tressler" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Add batch" }))
    const second = screen.getByRole("group", { name: "Batch 2" })
    fireEvent.change(within(second).getByLabelText("Qty"), {
      target: { value: "3" },
    })
    fireEvent.change(within(second).getByLabelText("Location"), {
      target: { value: "area18" },
    })
    expect(screen.getByText("Total 5")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    await waitFor(() => expect(h.create).toHaveBeenCalled())
    expect(request()).toMatchObject({
      base_price: 14000,
      lots: [
        { quantity: 2, location_id: "port-tressler" },
        { quantity: 3, location_id: "area18" },
      ],
    })
  })

  it("lets the user change a picked item", async () => {
    renderDialog()
    fireEvent.click(screen.getByRole("button", { name: "Change item" }))
    expect(screen.getByTestId("item-search")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled()
  })

  it("warns an unverified account and doesn't publish", () => {
    h.session = {
      status: "authenticated",
      profile: { username: "mira", rsi_confirmed: false },
    }
    renderDialog()
    expect(
      screen.getByText(/Your account must be verified/),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled()
  })
})
