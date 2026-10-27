/**
 * Creating an org shop sent the org's Spectrum ID as contractor_id (the API
 * wants the org's contractor_id UUID) and dropped the tags, languages and
 * "Accept custom orders" the form collects.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../../hooks/styles/Theme"

const ORG_ID = "6f1c2c3e-1b2a-4c5d-8e9f-0a1b2c3d4e5f"

const { createShop, orgQuery, availability } = vi.hoisted(() => ({
  createShop: vi.fn(),
  orgQuery: vi.fn(),
  availability: vi.fn(),
}))

vi.mock("../../../../store/api/v2/market", () => ({
  useCreateShopMutation: () => [
    (arg: unknown) => ({
      unwrap: async () => (await createShop(arg)) ?? { slug: "org-shop" },
    }),
    { isLoading: false },
  ],
  useGetShopSlugAvailabilityQuery: (arg: unknown, opts: { skip: boolean }) => {
    if (!opts.skip) availability(arg)
    return { data: undefined, isFetching: false }
  },
}))
vi.mock("../../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({
    data: { contractors: [{ spectrum_id: "TESTORG", name: "Test Org", roles: [] }] },
  }),
}))
vi.mock("../../../contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: (spectrumId: string, opts: { skip: boolean }) =>
    orgQuery(spectrumId, opts),
}))
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

import { CreateShop } from "../CreateShop"

describe("CreateShop", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    orgQuery.mockImplementation((spectrumId: string, { skip }: { skip: boolean }) =>
      skip
        ? { data: undefined, isFetching: false }
        : { data: { spectrum_id: spectrumId, contractor_id: ORG_ID }, isFetching: false },
    )
  })

  it("sends the org's contractor_id and the tags, languages and custom-orders setting", async () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <MemoryRouter>
          <CreateShop />
        </MemoryRouter>
      </ThemeProvider>,
    )

    fireEvent.change(screen.getByLabelText(/Shop Name/), { target: { value: "Org Shop" } })
    fireEvent.click(screen.getByLabelText("Organization shop"))
    fireEvent.change(screen.getByLabelText("Organization"), { target: { value: "TESTORG" } })

    fireEvent.mouseDown(screen.getByLabelText("Tags"))
    fireEvent.click(await screen.findByText("Mining"))
    fireEvent.mouseDown(screen.getByLabelText("Supported Languages"))
    fireEvent.click(await screen.findByText("French"))
    fireEvent.click(screen.getByLabelText("Accept custom orders"))

    fireEvent.click(screen.getByRole("button", { name: /Create Shop/ }))

    await waitFor(() => expect(createShop).toHaveBeenCalled())
    expect(createShop.mock.calls[0][0].createShopRequest).toMatchObject({
      name: "Org Shop",
      slug: "org-shop",
      contractor_id: ORG_ID,
      tags: ["Mining"],
      supported_languages: ["fr"],
      accepts_custom_orders: true,
    })
  })

  it("sends no contractor_id for a personal shop", async () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <MemoryRouter>
          <CreateShop />
        </MemoryRouter>
      </ThemeProvider>,
    )
    fireEvent.change(screen.getByLabelText(/Shop Name/), { target: { value: "My Shop" } })
    fireEvent.click(screen.getByRole("button", { name: /Create Shop/ }))

    await waitFor(() => expect(createShop).toHaveBeenCalled())
    expect(createShop.mock.calls[0][0].createShopRequest.contractor_id).toBeUndefined()
  })

  it("checks the slug for the org and offers the 409's suggestions as chips", async () => {
    createShop.mockRejectedValueOnce({
      status: 409,
      data: {
        error: {
          code: "CONFLICT",
          message: "Another shop already uses this URL",
          details: {
            slug: "org-shop",
            available: false,
            reason: "taken",
            suggestions: ["org-shop-2", "org-shop-testorg"],
          },
        },
      },
    })
    render(
      <ThemeProvider theme={mainTheme}>
        <MemoryRouter>
          <CreateShop />
        </MemoryRouter>
      </ThemeProvider>,
    )
    fireEvent.change(screen.getByLabelText(/Shop Name/), { target: { value: "Org Shop" } })
    fireEvent.click(screen.getByLabelText("Organization shop"))
    fireEvent.change(screen.getByLabelText("Organization"), { target: { value: "TESTORG" } })

    await waitFor(() =>
      expect(availability).toHaveBeenCalledWith({
        slug: "org-shop",
        contractorId: ORG_ID,
        shopId: undefined,
      }),
    )

    fireEvent.click(screen.getByRole("button", { name: /Create Shop/ }))
    fireEvent.click(await screen.findByText("org-shop-testorg"))
    fireEvent.click(screen.getByRole("button", { name: /Create Shop/ }))

    await waitFor(() => expect(createShop).toHaveBeenCalledTimes(2))
    expect(createShop.mock.calls[1][0].createShopRequest.slug).toBe("org-shop-testorg")
  })
})
