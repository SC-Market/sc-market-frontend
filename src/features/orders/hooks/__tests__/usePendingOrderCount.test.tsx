import React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("../../../profile/api/profileApi", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useGetUserProfileQuery: () => ({ data: { username: "tester" } }),
  }
})

import { makeStore } from "../../../../store/store"
import { browserNetworkEnv } from "../../../../store/browserNetworkEnv"
import { usePendingOrderCount } from "../usePendingOrderCount"
import { useGetNotificationsQuery } from "../../../notifications/api/notificationApi"
import { CHROME_NOTIFICATIONS_ARGS } from "../../../notifications/chromeNotifications"
import {
  armStartupDeferral,
  openStartupGate,
  resetStartupDeferralForTests,
} from "../../../../util/startupDeferral"

let requests: string[]
let originalFetch: typeof fetch

beforeEach(() => {
  resetStartupDeferralForTests()
  requests = []
  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    requests.push(`${url.pathname}${url.search}`)
    return Promise.resolve(
      new Response(
        JSON.stringify({
          data: {
            notifications: [],
            pagination: {
              total: 0,
              currentPage: 0,
              pageSize: 5,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
            unread_count: 7,
            unread_order_count: 3,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )
  }) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
  resetStartupDeferralForTests()
})

function Badge() {
  return <span data-testid="badge">{usePendingOrderCount()}</span>
}

/** The bell's first page (useNotifications' initial args). */
function Bell() {
  const { data } = useGetNotificationsQuery(CHROME_NOTIFICATIONS_ARGS)
  return <span data-testid="bell">{data?.unread_count ?? "-"}</span>
}

describe("usePendingOrderCount", () => {
  it("reads unread_order_count from the bell's request: one request for both", async () => {
    render(
      <Provider store={makeStore({ networkEnv: browserNetworkEnv })}>
        <Badge />
        <Bell />
      </Provider>,
    )
    await waitFor(() => expect(screen.getByTestId("badge").textContent).toBe("3"))
    expect(screen.getByTestId("bell").textContent).toBe("7")
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(requests).toEqual(["/api/notification/0?pageSize=5"])
  })

  it("waits for the startup gate on the first page load", async () => {
    armStartupDeferral()
    render(
      <Provider store={makeStore({ networkEnv: browserNetworkEnv })}>
        <Badge />
      </Provider>,
    )
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(requests).toEqual([])
    expect(screen.getByTestId("badge").textContent).toBe("0")
    act(() => openStartupGate())
    await waitFor(() => expect(screen.getByTestId("badge").textContent).toBe("3"))
    expect(requests).toHaveLength(1)
  })
})
