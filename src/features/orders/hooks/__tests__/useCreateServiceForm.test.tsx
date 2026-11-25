/**
 * Bug report: "every time I make a listing for my org it posts to my personal
 * shop". The service form takes its owner from the shop in the URL, but the
 * Create Service buttons opened /order/service/create, which has no shop, so
 * every new service was created as the user's own. New services are now
 * created at /shop/:slug/services/create; this checks the owner sent there.
 */
import React from "react"
import { act, render } from "@testing-library/react"
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { ShopResponse } from "../../../../store/api/v2/market"

const mockCreateService = vi.fn()
vi.mock("../../../services/api/servicesApi", () => ({
  useCreateServiceMutation: () => [mockCreateService],
  useUpdateServiceMutation: () => [vi.fn()],
  useUploadServicePhotosMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../../../store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
}))
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

import { useCreateServiceForm } from "../useCreateServiceForm"

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
function Form() {
  submit = useCreateServiceForm().submitService
  return null
}

async function submitIn(shop: ShopResponse) {
  submit = () => {
    throw new Error("the form did not render")
  }
  render(
    <MemoryRouter initialEntries={[`/shop/${shop.slug}/services/create`]}>
      <Routes>
        <Route path="/shop/:shopSlug" element={<Outlet context={{ shop }} />}>
          <Route path="services/create" element={<Form />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
  await act(async () => submit())
}

describe("useCreateServiceForm", () => {
  beforeEach(() => {
    mockCreateService.mockReset()
    mockCreateService.mockReturnValue({
      unwrap: () => Promise.resolve({ service_id: "svc-1" }),
    })
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
})
