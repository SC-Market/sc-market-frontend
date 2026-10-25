import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { AdminFeatureFlagsView } from "../AdminFeatureFlagsView"
import * as marketApi from "../../../store/api/v2/market"

vi.mock("../../../store/api/v2/market", () => ({
  useGetStatsQuery: vi.fn(),
}))

const mockUseGetStatsQuery = vi.mocked(marketApi.useGetStatsQuery)
const refetch = vi.fn()

function mockQuery(state: Record<string, unknown>) {
  mockUseGetStatsQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch,
    ...state,
  } as unknown as ReturnType<typeof marketApi.useGetStatsQuery>)
}

const renderView = () =>
  render(
    <MemoryRouter>
      <AdminFeatureFlagsView />
    </MemoryRouter>,
  )

describe("AdminFeatureFlagsView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows skeleton rows, not the empty message, while loading", () => {
    mockQuery({ isLoading: true })
    const { container } = renderView()

    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0)
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByText("No feature flags configured")).not.toBeInTheDocument()
  })

  it("shows an error with a working retry, not the empty message", () => {
    mockQuery({ isError: true })
    renderView()

    expect(screen.getByText("Failed to load feature flags.")).toBeInTheDocument()
    expect(screen.queryByText("No feature flags configured")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it("lists the flags once loaded", () => {
    mockQuery({
      data: [
        {
          flag_name: "market_v2_redesign",
          enabled: true,
          default_version: "V1",
          rollout_percentage: 25,
          override_count: 2,
          enabled_overrides: 2,
          disabled_overrides: 0,
        },
      ],
    })
    const { container } = renderView()

    expect(screen.getByText("market V2 redesign")).toBeInTheDocument()
    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBe(0)
    expect(screen.queryByText("Failed to load feature flags.")).not.toBeInTheDocument()
  })

  it("shows the empty message when no flags are configured", () => {
    mockQuery({ data: [] })
    renderView()

    expect(screen.getByText("No feature flags configured")).toBeInTheDocument()
  })
})
