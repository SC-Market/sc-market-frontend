/**
 * The white-label domain answer reaches the page it was asked on.
 *
 * Regression: the custom-domain context was fixed at the first render from
 * the localStorage cache, so a first visit to an org's subdomain (no cache)
 * stayed the main site for the whole visit: `/` was SC Market's landing page,
 * the sidebar had no org brand or links, and only the org's colours applied.
 */
import React from "react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { act, render, renderHook, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom"

type DomainResult = {
  data?: { data: Record<string, unknown> }
  error?: { status: unknown }
}
const resolveDomain = vi.hoisted(() =>
  vi.fn<(hostname: string) => DomainResult>(),
)
vi.mock("../../../store/api/contractors", () => ({
  contractorsApi: {
    endpoints: {
      resolveDomain: {
        // A thunk, like RTK Query's initiate: dispatch returns its result.
        initiate: (hostname: string) => () =>
          Object.assign(Promise.resolve(resolveDomain(hostname)), {
            unsubscribe: vi.fn(),
          }),
      },
    },
  },
}))

// The landing page's own sections are not under test: a marker instead.
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: () => <div>SC Market landing</div>,
}))
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => ({ status: "anonymous" }),
}))

import {
  CustomDomainContext,
  cacheDomainOrg,
  getWhiteLabelConfig,
  type CustomDomain,
} from "../CustomDomain"
import { useResolvedCustomDomain } from "../useResolvedCustomDomain"
import { LandingPage } from "../../../pages/home/LandingPage"

const MEDRUNNER = {
  spectrum_id: "MEDRUNNER",
  contractor_id: "e615a12b",
  name: "MEDRUNNER SERVICES",
  focus_mode: "public",
  homepage_path: null,
  require_membership: false,
}

/** An org's host whose answer isn't cached yet (a first visit). */
const COLD: CustomDomain = { isCustomDomain: true, customOrg: undefined }

const createStore = () => configureStore({ reducer: { noop: () => ({}) } })

function storeWrapper({ children }: { children: React.ReactNode }) {
  return <Provider store={createStore()}>{children}</Provider>
}

const flush = () => act(async () => {})

beforeEach(() => {
  localStorage.clear()
  resolveDomain.mockReset()
})

describe("useResolvedCustomDomain", () => {
  it("applies the API's answer to the page on a first visit", async () => {
    resolveDomain.mockReturnValue({ data: { data: MEDRUNNER } })
    const { result } = renderHook(() => useResolvedCustomDomain(() => COLD), {
      wrapper: storeWrapper,
    })
    expect(result.current.customOrg).toBeUndefined()
    await flush()
    expect(resolveDomain).toHaveBeenCalledWith(window.location.hostname)
    expect(result.current).toEqual({
      isCustomDomain: true,
      customOrg: "MEDRUNNER",
    })
    expect(getWhiteLabelConfig()?.name).toBe("MEDRUNNER SERVICES")
  })

  it("keeps the same value when the answer is what the cache had", async () => {
    cacheDomainOrg(MEDRUNNER)
    resolveDomain.mockReturnValue({ data: { data: MEDRUNNER } })
    const initial = { isCustomDomain: true, customOrg: "MEDRUNNER" }
    const { result } = renderHook(
      () => useResolvedCustomDomain(() => initial),
      { wrapper: storeWrapper },
    )
    await flush()
    expect(result.current).toBe(initial)
  })

  it("re-renders readers when the org's settings changed", async () => {
    cacheDomainOrg(MEDRUNNER)
    resolveDomain.mockReturnValue({
      data: { data: { ...MEDRUNNER, focus_mode: "internal" } },
    })
    const initial = { isCustomDomain: true, customOrg: "MEDRUNNER" }
    const { result } = renderHook(
      () => useResolvedCustomDomain(() => initial),
      { wrapper: storeWrapper },
    )
    await flush()
    expect(result.current).not.toBe(initial)
    expect(result.current.customOrg).toBe("MEDRUNNER")
    expect(getWhiteLabelConfig()?.focus_mode).toBe("internal")
  })

  it("drops a cached org the API says this host no longer belongs to", async () => {
    cacheDomainOrg(MEDRUNNER)
    resolveDomain.mockReturnValue({ error: { status: 404 } })
    const { result } = renderHook(
      () =>
        useResolvedCustomDomain(() => ({
          isCustomDomain: true,
          customOrg: "MEDRUNNER",
        })),
      { wrapper: storeWrapper },
    )
    await flush()
    expect(result.current).toEqual({
      isCustomDomain: true,
      customOrg: undefined,
    })
    expect(getWhiteLabelConfig()).toBeNull()
  })

  it("keeps the cached org when the API is unreachable", async () => {
    cacheDomainOrg(MEDRUNNER)
    resolveDomain.mockReturnValue({ error: { status: "FETCH_ERROR" } })
    const { result } = renderHook(
      () =>
        useResolvedCustomDomain(() => ({
          isCustomDomain: true,
          customOrg: "MEDRUNNER",
        })),
      { wrapper: storeWrapper },
    )
    await flush()
    expect(result.current.customOrg).toBe("MEDRUNNER")
    expect(getWhiteLabelConfig()?.spectrum_id).toBe("MEDRUNNER")
  })

  it("asks nothing on the main site", async () => {
    renderHook(
      () =>
        useResolvedCustomDomain(() => ({
          isCustomDomain: false,
          customOrg: undefined,
        })),
      { wrapper: storeWrapper },
    )
    await flush()
    expect(resolveDomain).not.toHaveBeenCalled()
  })
})

/** HookProvider's custom-domain provider, around the routes. */
function DomainProvider(props: {
  initial: CustomDomain
  children: React.ReactNode
}) {
  const value = useResolvedCustomDomain(() => props.initial)
  return (
    <CustomDomainContext.Provider value={value}>
      {props.children}
    </CustomDomainContext.Provider>
  )
}

function OrgPage() {
  return <div>Org storefront {useParams().contractor_id}</div>
}

function renderHome(initial: CustomDomain) {
  return render(
    <Provider store={createStore()}>
      <DomainProvider initial={initial}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/contractor/:contractor_id" element={<OrgPage />} />
            <Route path="/dashboard" element={<div>Assigned to me</div>} />
            <Route path="/fleet" element={<div>Org fleet page</div>} />
          </Routes>
        </MemoryRouter>
      </DomainProvider>
    </Provider>,
  )
}

describe("/ on an org's white-label host, first visit", () => {
  it("public: opens the org's storefront once the domain answer is in", async () => {
    resolveDomain.mockReturnValue({ data: { data: MEDRUNNER } })
    renderHome(COLD)
    await flush()
    expect(screen.getByText("Org storefront MEDRUNNER")).toBeInTheDocument()
    expect(screen.queryByText("SC Market landing")).not.toBeInTheDocument()
  })

  it("the org's chosen landing page wins", async () => {
    resolveDomain.mockReturnValue({
      data: { data: { ...MEDRUNNER, homepage_path: "/fleet" } },
    })
    renderHome(COLD)
    await flush()
    expect(screen.getByText("Org fleet page")).toBeInTheDocument()
  })

  it("internal: opens the member's Assigned to Me page", async () => {
    resolveDomain.mockReturnValue({
      data: { data: { ...MEDRUNNER, focus_mode: "internal" } },
    })
    renderHome(COLD)
    await flush()
    expect(screen.getByText("Assigned to me")).toBeInTheDocument()
  })

  it("a host that is no org's keeps SC Market's landing page", async () => {
    resolveDomain.mockReturnValue({ error: { status: 404 } })
    renderHome(COLD)
    await flush()
    expect(screen.getByText("SC Market landing")).toBeInTheDocument()
  })
})
