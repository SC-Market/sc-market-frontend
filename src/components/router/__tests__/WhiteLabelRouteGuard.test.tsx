import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import {
  CustomDomainContext,
  type CustomDomain,
} from "../../../hooks/contractor/CustomDomain"

let mockSidebar = { hidden: new Set<string>(), customTabs: [], loaded: true }
vi.mock("../../../features/contractor/hooks/useWhiteLabelSidebar", () => ({
  useWhiteLabelSidebar: () => mockSidebar,
}))

import {
  WhiteLabelRouteGuard,
  useWhiteLabelOwnerHandoff,
} from "../WhiteLabelRouteGuard"

const replace = vi.fn()

beforeEach(() => {
  vi.stubGlobal("location", { ...window.location, replace })
  mockSidebar = { hidden: new Set(), customTabs: [], loaded: true }
})
afterEach(() => {
  vi.unstubAllGlobals()
  replace.mockReset()
})

function renderAt(path: string, domain: CustomDomain, page = <p>page</p>) {
  return render(
    <CustomDomainContext.Provider value={domain}>
      <MemoryRouter initialEntries={[path]}>
        <WhiteLabelRouteGuard>{page}</WhiteLabelRouteGuard>
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

  it("sends another org's page and users' profiles to sc-market.space", () => {
    renderAt("/contractor/OTHERORG", WL)
    expect(replace).toHaveBeenCalledWith(
      "https://sc-market.space/contractor/OTHERORG",
    )
    renderAt("/user/someone", WL)
    expect(replace).toHaveBeenCalledWith("https://sc-market.space/user/someone")
  })

  it("sends a tab the org turned off to sc-market.space, once its settings load", () => {
    mockSidebar = {
      hidden: new Set(["contracts"]),
      customTabs: [],
      loaded: false,
    }
    const { unmount } = renderAt("/contracts", WL)
    expect(screen.getByText("page")).toBeInTheDocument()
    unmount()
    mockSidebar = {
      hidden: new Set(["contracts"]),
      customTabs: [],
      loaded: true,
    }
    renderAt("/contracts", WL)
    expect(screen.queryByText("page")).not.toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith("https://sc-market.space/contracts")
  })

  it("renders the org's own pages", () => {
    renderAt("/contractor/MEDRUNNER", WL)
    expect(screen.getByText("page")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("renders every page on the main site", () => {
    mockSidebar = { hidden: new Set(), customTabs: [], loaded: true }
    renderAt("/buyorders", MAIN)
    expect(screen.getByText("page")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})

function Owned({ owner }: { owner: string | null | undefined }) {
  return useWhiteLabelOwnerHandoff(owner) ? null : <p>listing</p>
}

describe("useWhiteLabelOwnerHandoff", () => {
  it.each([
    ["another org's", "BWINCORP"],
    ["a user seller's", null],
  ])("sends %s listing to sc-market.space", (_, owner) => {
    renderAt("/market/abc", WL, <Owned owner={owner} />)
    expect(screen.queryByText("listing")).not.toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith("https://sc-market.space/market/abc")
  })

  it("keeps the org's own, and waits while the owner is unknown", () => {
    renderAt("/market/abc", WL, <Owned owner="medrunner" />)
    renderAt("/market/def", WL, <Owned owner={undefined} />)
    expect(screen.getAllByText("listing")).toHaveLength(2)
    expect(replace).not.toHaveBeenCalled()
  })

  it("keeps everything on the main site", () => {
    renderAt("/market/abc", MAIN, <Owned owner="BWINCORP" />)
    expect(screen.getByText("listing")).toBeInTheDocument()
  })
})
