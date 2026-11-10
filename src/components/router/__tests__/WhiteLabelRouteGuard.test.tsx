import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import {
  CustomDomainContext,
  type CustomDomain,
} from "../../../hooks/contractor/CustomDomain"
import { WhiteLabelRouteGuard } from "../WhiteLabelRouteGuard"

const replace = vi.fn()

beforeEach(() => {
  vi.stubGlobal("location", { ...window.location, replace })
})
afterEach(() => {
  vi.unstubAllGlobals()
  replace.mockReset()
})

function renderAt(path: string, domain: CustomDomain) {
  return render(
    <CustomDomainContext.Provider value={domain}>
      <MemoryRouter initialEntries={[path]}>
        <WhiteLabelRouteGuard>
          <p>page</p>
        </WhiteLabelRouteGuard>
      </MemoryRouter>
    </CustomDomainContext.Provider>,
  )
}

const WL: CustomDomain = { isCustomDomain: true, customOrg: "MEDRUNNER" }
const MAIN: CustomDomain = { isCustomDomain: false, customOrg: undefined }

describe("WhiteLabelRouteGuard", () => {
  it("sends an SC Market-wide page to sc-market.space instead of rendering it", () => {
    renderAt("/buyorders?sort=price#top", WL)
    expect(screen.queryByText("page")).not.toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith(
      "https://sc-market.space/buyorders?sort=price#top",
    )
  })

  it("sends another org's page to sc-market.space", () => {
    renderAt("/contractor/OTHERORG", WL)
    expect(screen.queryByText("page")).not.toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith(
      "https://sc-market.space/contractor/OTHERORG",
    )
  })

  it("renders the org's own pages", () => {
    renderAt("/contractor/MEDRUNNER", WL)
    expect(screen.getByText("page")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("renders every page on the main site", () => {
    renderAt("/buyorders", MAIN)
    expect(screen.getByText("page")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
