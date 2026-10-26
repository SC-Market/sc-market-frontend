import "./setup"
/**
 * "Add Lot" on the shop Stock page used to show "Lot created successfully"
 * without calling any API (CreateLotDialogV2 had a TODO where the request
 * belonged, and was handed itemId=""). It must create the lot through
 * POST /stock-lots on the chosen listing's item, and only report success
 * when that request succeeds.
 */
import React from "react"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Mock } from "vitest"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { mockMutationHook, querySuccess } from "../../../../../__tests__/rtkQueryMocks"
import type { GetListingDetailApiResponse } from "../../../../../store/api/v2/market"

type MarketV2Module = typeof import("../../../../../store/api/v2/market")
type MarketV2Endpoints = MarketV2Module["marketV2Api"]["endpoints"]

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string, opts?: Record<string, string>) =>
        (defaultValue || key).replace(/\{\{(\w+)\}\}/g, (_m, k) => opts?.[k] ?? ""),
      i18n: { language: "en", changeLanguage: vi.fn() },
    }),
  }
})

const issueAlert = vi.fn()
vi.mock("../../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => issueAlert,
}))

vi.mock("../../../components/stock/LocationSelector", () => ({
  LocationSelector: () => null,
}))

const h = vi.hoisted(() => ({
  createTrigger: null as unknown as Mock,
  details: {} as Record<string, unknown>,
}))

vi.mock("../../../../../store/api/v2/market", () => ({
  useGetVariantTypesQuery: () => ({ data: undefined }),
  useGetListingDetailQuery: ({ id }: { id: string }) =>
    querySuccess<MarketV2Endpoints["getListingDetail"]>(
      h.details[id] as GetListingDetailApiResponse,
    ),
  useCreateStockLotMutation: () => {
    const hook = mockMutationHook<MarketV2Endpoints["createStockLot"]>()
    return [h.createTrigger, hook[1]]
  },
}))

import { CreateLotDialogV2 } from "../CreateLotDialogV2"

function detail(listingId: string, itemIds: string[]): GetListingDetailApiResponse {
  return {
    listing: { listing_id: listingId } as GetListingDetailApiResponse["listing"],
    seller: {} as GetListingDetailApiResponse["seller"],
    items: itemIds.map((item_id) => ({
      item_id,
      game_item: { id: `gi-${item_id}`, name: `Item ${item_id}`, type: "weapon" },
      pricing_mode: "unified",
      variants: [],
    })) as GetListingDetailApiResponse["items"],
  }
}

const theme = createTheme()
const onClose = vi.fn()

function renderDialog() {
  return render(
    <ThemeProvider theme={theme}>
      <CreateLotDialogV2
        open
        onClose={onClose}
        listings={[
          { listing_id: "listing-1", title: "Laser Rifle" },
          { listing_id: "listing-2", title: "Medpen" },
        ]}
        defaultListingId="listing-1"
        locations={[]}
      />
    </ThemeProvider>,
  )
}

function setQuantity(value: string) {
  fireEvent.change(screen.getByLabelText(/Quantity/), { target: { value } })
}

describe("CreateLotDialogV2", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.details = {
      "listing-1": detail("listing-1", ["item-1"]),
      "listing-2": detail("listing-2", ["item-2"]),
    }
    h.createTrigger = vi.fn(() => ({ unwrap: () => Promise.resolve({ lot: {} }) }))
  })

  it("creates the lot on the chosen listing's item and reports success", async () => {
    renderDialog()
    setQuantity("12")
    fireEvent.click(screen.getByRole("button", { name: "Create Lot" }))

    await waitFor(() => expect(h.createTrigger).toHaveBeenCalledTimes(1))
    expect(h.createTrigger).toHaveBeenCalledWith({
      createStockLotRequest: {
        item_id: "item-1",
        quantity: 12,
        variant_attributes: { quality_tier: 3 },
        location_id: undefined,
        listed: true,
        notes: undefined,
      },
    })
    await waitFor(() =>
      expect(issueAlert).toHaveBeenCalledWith({ message: "Lot created", severity: "success" }),
    )
    expect(onClose).toHaveBeenCalled()
  })

  it("uses the item of the listing picked in the form", async () => {
    renderDialog()
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Listing/ }))
    fireEvent.click(within(screen.getByRole("listbox")).getByText("Medpen"))
    setQuantity("3")
    fireEvent.click(screen.getByRole("button", { name: "Create Lot" }))

    await waitFor(() => expect(h.createTrigger).toHaveBeenCalledTimes(1))
    expect(h.createTrigger.mock.calls[0][0].createStockLotRequest.item_id).toBe("item-2")
  })

  it("shows the server's reason and stays open when the request fails", async () => {
    h.createTrigger = vi.fn(() => ({
      unwrap: () =>
        Promise.reject({
          status: 403,
          data: { error: { code: "FORBIDDEN", message: "You do not have permission to add stock to this listing" } },
        }),
    }))
    renderDialog()
    setQuantity("5")
    fireEvent.click(screen.getByRole("button", { name: "Create Lot" }))

    await waitFor(() =>
      expect(issueAlert).toHaveBeenCalledWith({
        message: "Failed to create lot: You do not have permission to add stock to this listing",
        severity: "error",
      }),
    )
    expect(issueAlert).not.toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it("does not call the API for an invalid quantity", async () => {
    renderDialog()
    fireEvent.click(screen.getByRole("button", { name: "Create Lot" }))
    await waitFor(() =>
      expect(issueAlert).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" })),
    )
    expect(h.createTrigger).not.toHaveBeenCalled()
  })

  it("can't submit until a bundle's item is picked", () => {
    h.details["listing-1"] = detail("listing-1", ["item-a", "item-b"])
    renderDialog()
    expect(screen.getByRole("button", { name: "Create Lot" })).toBeDisabled()
    expect(screen.getByRole("combobox", { name: /Item/ })).toBeInTheDocument()
  })
})
