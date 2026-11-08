import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Button } from "@mui/material"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({ merging: false, merge: vi.fn() }))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => false,
}))
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: undefined }),
}))
vi.mock("../../../features/offers/api/offerApi", () => ({
  useSearchOfferSessionsQuery: () => ({ data: undefined, isLoading: false }),
  useMergeOfferSessionsMutation: () => [h.merge, { isLoading: h.merging }],
}))

import { useOfferSearch } from "../../../features/offers/hooks/useOfferSearch"
import { MergeOffersDialog } from "../MergeOffersDialog"

function Harness({ ids }: { ids: string[] }) {
  const search = useOfferSearch({})
  return (
    <>
      <Button
        onClick={() => {
          search.handleSelectChange(ids)
          search.setMergeModalOpen(true)
        }}
      >
        open merge
      </Button>
      <MergeOffersDialog search={search} />
    </>
  )
}

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)

beforeEach(() => {
  h.merging = false
  h.merge.mockReset()
})

describe("MergeOffersDialog", () => {
  it("is named by its title and described by the consequence", async () => {
    wrap(<Harness ids={["a", "b"]} />)
    fireEvent.click(screen.getByText("open merge"))
    const dialog = screen.getByRole("dialog", {
      name: "Merge offer sessions?",
    })
    expect(dialog).toHaveAccessibleDescription(
      "Merging 2 offer sessions will create a new merged offer session and close the selected sessions. This action cannot be undone.",
    )
    expect(screen.getByRole("button", { name: "Merge Offers" })).toBeEnabled()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("Merge needs two offers", () => {
    wrap(<Harness ids={["a"]} />)
    fireEvent.click(screen.getByText("open merge"))
    expect(screen.getByRole("button", { name: "Merge Offers" })).toBeDisabled()
  })

  it("nothing closes while merging", () => {
    h.merging = true
    wrap(<Harness ids={["a", "b"]} />)
    fireEvent.click(screen.getByText("open merge"))
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
  })
})
