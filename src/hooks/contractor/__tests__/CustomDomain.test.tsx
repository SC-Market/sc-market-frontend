import React from "react"
import { renderHook } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import {
  CustomDomainContext,
  cacheDomainOrg,
  resolveBrowserCustomDomain,
  useCustomDomain,
} from "../CustomDomain"

describe("CustomDomain", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("treats the main site as not a custom domain, even with a cached org", () => {
    // happy-dom serves tests from localhost, one of the main-site hostnames.
    cacheDomainOrg({ spectrum_id: "ORG", contractor_id: "c1", name: "Org" })
    expect(resolveBrowserCustomDomain()).toEqual({
      isCustomDomain: false,
      customOrg: undefined,
    })
  })

  it("useCustomDomain returns the provided value", () => {
    const value = { isCustomDomain: true, customOrg: "ORG" }
    const { result } = renderHook(useCustomDomain, {
      wrapper: ({ children }) => (
        <CustomDomainContext.Provider value={value}>
          {children}
        </CustomDomainContext.Provider>
      ),
    })
    expect(result.current).toBe(value)
  })

  it("useCustomDomain is the main site outside a provider", () => {
    const { result } = renderHook(useCustomDomain)
    expect(result.current).toEqual({ isCustomDomain: false, customOrg: undefined })
  })
})
