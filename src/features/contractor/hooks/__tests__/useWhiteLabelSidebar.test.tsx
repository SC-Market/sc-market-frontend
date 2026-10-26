/**
 * The white-label sidebar settings, read from the API for the org whose
 * domain this is. Nothing applies on sc-market.space.
 */
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { CustomDomainContext } from "../../../../hooks/contractor/CustomDomain"

const items = [
  { standard_tab_key: "market", custom_label: null, custom_path: null, custom_icon: null, is_external: false, enabled: true, sort_order: 0 },
  { standard_tab_key: "recruiting", custom_label: null, custom_path: null, custom_icon: null, is_external: false, enabled: false, sort_order: 1 },
  { standard_tab_key: null, custom_label: "B", custom_path: "/b", custom_icon: "link", is_external: false, enabled: true, sort_order: 3 },
  { standard_tab_key: null, custom_label: "A", custom_path: "https://a.example.com", custom_icon: "link", is_external: true, enabled: true, sort_order: 2 },
]
const query = vi.hoisted(() => vi.fn())
vi.mock("../../../../store/api/contractors", () => ({
  useGetWhitelabelSidebarQuery: (...args: unknown[]) => query(...args),
}))
const result = { data: { data: items } }
query.mockImplementation((_id: string, { skip }: { skip: boolean }) => (skip ? {} : result))

import { useWhiteLabelSidebar } from "../useWhiteLabelSidebar"

function onDomain(customOrg: string | undefined) {
  return ({ children }: { children: React.ReactNode }) => (
    <CustomDomainContext.Provider value={{ isCustomDomain: !!customOrg, customOrg }}>
      {children}
    </CustomDomainContext.Provider>
  )
}

describe("useWhiteLabelSidebar", () => {
  it("returns the hidden tabs and custom tabs in order on the org's domain", () => {
    const { result: r } = renderHook(() => useWhiteLabelSidebar(), { wrapper: onDomain("WLORG") })
    expect([...r.current.hidden]).toEqual(["recruiting"])
    expect(r.current.customTabs.map((t) => t.custom_label)).toEqual(["A", "B"])
  })

  it("applies nothing on the main site", () => {
    const { result: r } = renderHook(() => useWhiteLabelSidebar(), { wrapper: onDomain(undefined) })
    expect(r.current.hidden.size).toBe(0)
    expect(r.current.customTabs).toEqual([])
  })
})
