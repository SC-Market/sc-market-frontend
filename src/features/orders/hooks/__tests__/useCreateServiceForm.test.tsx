/**
 * Bug report: "every time I make a listing for my org it posts to my personal
 * shop". The service form takes its owner from the shop in the URL, but the
 * Create Service buttons opened /order/service/create, which has no shop, so
 * every new service was created as the user's own. New services are now
 * created at /shop/:slug/services/create; this checks the owner sent there.
 *
 * Also: the type was labelled optional but the API rejects an empty one, and
 * saving landed on the edit page (create) or the generic services list
 * (update) instead of the service itself.
 */
import React from "react"
import { act, render, screen } from "@testing-library/react"
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { ShopResponse } from "../../../../store/api/v2/market"

const mockCreateService = vi.fn()
const mockUpdateService = vi.fn()
vi.mock("../../../services/api/servicesApi", () => ({
  useCreateServiceMutation: () => [mockCreateService],
  useUpdateServiceMutation: () => [mockUpdateService],
  useUploadServicePhotosMutation: () => [vi.fn(), { isLoading: false }],
}))
// Stable across renders, like the real ones: a new dispatch per render makes
// the starmap-suggestion effect re-run forever while the form stays mounted.
const mockDispatch = vi.fn()
const mockAlert = vi.fn()
vi.mock("../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}))
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => mockAlert,
}))

import { useCreateServiceForm } from "../useCreateServiceForm"
import type { Service } from "../../domain/types"

const orgShop = {
  shop_id: "org-shop",
  slug: "org-shop",
  is_org_owned: true,
  owner_contractor_spectrum_id: "~TESTORG",
} as ShopResponse
const personalShop = {
  shop_id: "mine",
  slug: "mine",
  is_org_owned: false,
  owner_contractor_spectrum_id: null,
} as ShopResponse

let submit: () => void = () => {}
let submitAttempted = false
function Form(props: { type?: string; service?: Service }) {
  const form = useCreateServiceForm(props.service)
  const { state, setState } = form
  const { type = "Transport" } = props
  React.useEffect(() => {
    if (state.type !== type) setState({ ...state, type })
  }, [state, setState, type])
  submit = form.submitService
  submitAttempted = form.submitAttempted
  return null
}

function ServicePage() {
  const { state } = useLocation()
  const shop = (state as { shopContext?: string } | null)?.shopContext
  return <div>service page{shop ? ` in ${shop}` : ""}</div>
}

async function submitIn(shop: ShopResponse, type?: string) {
  submit = () => {
    throw new Error("the form did not render")
  }
  render(
    <MemoryRouter initialEntries={[`/shop/${shop.slug}/services/create`]}>
      <Routes>
        <Route path="/shop/:shopSlug" element={<Outlet context={{ shop }} />}>
          <Route path="services/create" element={<Form type={type} />} />
        </Route>
        <Route path="/order/service/:service_id" element={<ServicePage />} />
        <Route path="/order/service/:service_id/edit" element={<p>edit</p>} />
      </Routes>
    </MemoryRouter>,
  )
  await act(async () => submit())
}

const existing = {
  service_id: "svc-9",
  service_name: "Hauling",
  kind: "Transport",
  photos: [],
  shop: { name: "Org Shop", slug: "org-shop" },
} as unknown as Service

async function updateExisting() {
  render(
    <MemoryRouter initialEntries={["/order/service/svc-9/edit"]}>
      <Routes>
        <Route
          path="/order/service/:service_id/edit"
          element={<Form service={existing} />}
        />
        <Route path="/order/service/:service_id" element={<ServicePage />} />
        <Route path="/order/services" element={<p>services list</p>} />
      </Routes>
    </MemoryRouter>,
  )
  await act(async () => submit())
}

describe("useCreateServiceForm", () => {
  beforeEach(() => {
    mockCreateService.mockReset()
    mockAlert.mockReset()
    mockCreateService.mockReturnValue({
      unwrap: () => Promise.resolve({ service_id: "svc-1" }),
    })
    mockUpdateService.mockReset()
    mockUpdateService.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  it("creates the service for the org when opened from its shop", async () => {
    await submitIn(orgShop)
    expect(mockCreateService).toHaveBeenCalledWith(
      expect.objectContaining({ contractor: "~TESTORG" }),
    )
  })

  it("creates the service for you when opened from your own shop", async () => {
    await submitIn(personalShop)
    expect(mockCreateService.mock.calls[0][0].contractor).toBeFalsy()
  })

  it("does not save a service without a type, and flags the field", async () => {
    await submitIn(orgShop, "")
    expect(mockCreateService).not.toHaveBeenCalled()
    expect(submitAttempted).toBe(true)
    expect(mockAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warning" }),
    )
  })

  it("sends the chosen type", async () => {
    await submitIn(orgShop, "Medical")
    expect(mockCreateService).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "Medical" }),
    )
  })

  it("opens the new service's page after creating it", async () => {
    await submitIn(orgShop)
    expect(await screen.findByText("service page in org-shop")).toBeTruthy()
  })

  it("opens the service's page after updating it", async () => {
    await updateExisting()
    expect(mockUpdateService).toHaveBeenCalledWith(
      expect.objectContaining({ service_id: "svc-9" }),
    )
    expect(await screen.findByText("service page in org-shop")).toBeTruthy()
  })
})
