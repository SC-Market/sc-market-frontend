import React from "react"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import * as marketApi from "../../../store/api/v2/market"
import type { StillSellingDryRun } from "../../../store/api/v2/market"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../store/api/v2/market", () => ({
  useGetStillSellingCampaignQuery: vi.fn(),
  useSendStillSellingCampaignMutation: vi.fn(),
  useStopStillSellingCampaignMutation: vi.fn(),
}))

import { StillSellingCampaignCard } from "../StillSellingCampaignCard"

const mockQuery = vi.mocked(marketApi.useGetStillSellingCampaignQuery)
const send = vi.fn()
const stop = vi.fn()
const refetch = vi.fn()

const dryRun = (
  over: Partial<StillSellingDryRun> = {},
): StillSellingDryRun => ({
  campaign: "still_selling_2026_11",
  kill_switch_env: "STILL_SELLING_CAMPAIGN_ENABLED",
  enabled: false,
  recipients: 42,
  listings: 130,
  sample: {
    locale: "en",
    text: "You have 3 listings on SC Market that haven't been updated in 2 months. Still selling?",
    buttons: [
      {
        label: "Keep them live",
        url: "https://sc-market.space/still-selling/<keep-link>",
      },
      {
        label: "Pause them",
        url: "https://sc-market.space/still-selling/<pause-link>",
      },
      {
        label: "Manage listings",
        url: "https://sc-market.space/shop/example-shop/listings",
      },
    ],
  },
  progress: {
    sent: 12,
    delivered: 9,
    failed: 3,
    failed_closed: 2,
    in_flight: 0,
    clicked_keep: 4,
    clicked_pause: 1,
    kept_listings: 11,
    paused_listings: 2,
  },
  run: {
    running: false,
    started_at: null,
    finished_at: null,
    finish_reason: null,
    limit: null,
    sent_this_run: 0,
  },
  batch_size: 10,
  batch_pause_seconds: 60,
  stale_days: 30,
  inactive_days: 30,
  ...over,
})

function state(data: StillSellingDryRun) {
  mockQuery.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch,
  } as unknown as ReturnType<typeof marketApi.useGetStillSellingCampaignQuery>)
}

beforeEach(() => {
  vi.clearAllMocks()
  send.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  stop.mockReturnValue(Promise.resolve({}))
  vi.mocked(marketApi.useSendStillSellingCampaignMutation).mockReturnValue([
    send,
    { isLoading: false, isError: false },
  ] as unknown as ReturnType<
    typeof marketApi.useSendStillSellingCampaignMutation
  >)
  vi.mocked(marketApi.useStopStillSellingCampaignMutation).mockReturnValue([
    stop,
    { isLoading: false },
  ] as unknown as ReturnType<
    typeof marketApi.useStopStillSellingCampaignMutation
  >)
})

describe("StillSellingCampaignCard", () => {
  it("shows the dry run, the sample DM and the progress", () => {
    state(dryRun())
    render(<StillSellingCampaignCard />)
    expect(screen.getByTestId("still-selling-dry-run")).toHaveTextContent(
      "Dry run: would DM 42 people about 130 listings.",
    )
    expect(screen.getByTestId("still-selling-sample-text")).toHaveTextContent(
      "You have 3 listings on SC Market that haven't been updated in 2 months. Still selling?",
    )
    expect(
      screen.getByRole("button", { name: "Keep them live" }),
    ).toBeDisabled()
    const progress = within(screen.getByTestId("still-selling-progress"))
    expect(progress.getByText("12")).toBeInTheDocument()
    expect(progress.getByText("9")).toBeInTheDocument()
    expect(progress.getByText("2")).toBeInTheDocument() // failed (closed)
    expect(progress.getByText("4")).toBeInTheDocument() // clicked keep
    expect(progress.getByText("11 · 2")).toBeInTheDocument()
  })

  it("kill switch off: says so and Send is disabled", () => {
    state(dryRun({ enabled: false }))
    render(<StillSellingCampaignCard />)
    expect(screen.getByTestId("still-selling-switch")).toHaveTextContent(
      "Sending is off. Nothing can be sent until STILL_SELLING_CAMPAIGN_ENABLED=true is set on the server.",
    )
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("kill switch on: Send asks to confirm, then sends the confirmed count", async () => {
    state(dryRun({ enabled: true }))
    render(<StillSellingCampaignCard />)
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    expect(send).not.toHaveBeenCalled()
    expect(screen.getByText("Send the campaign?")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Send to 42 people" }))
    expect(send).toHaveBeenCalledWith({
      stillSellingSendRequest: { expected_recipients: 42 },
    })
  })

  it("cancel in the confirm step sends nothing", () => {
    state(dryRun({ enabled: true }))
    render(<StillSellingCampaignCard />)
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(send).not.toHaveBeenCalled()
  })

  it("while running: progress line, Stop, no second Send", () => {
    state(
      dryRun({
        enabled: true,
        run: {
          running: true,
          started_at: "2026-11-02T12:00:00.000Z",
          finished_at: null,
          finish_reason: null,
          limit: 42,
          sent_this_run: 7,
        },
      }),
    )
    render(<StillSellingCampaignCard />)
    expect(screen.getByTestId("still-selling-running")).toHaveTextContent(
      "Sending: 7 of up to 42 this run.",
    )
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Stop" }))
    expect(stop).toHaveBeenCalled()
  })
})
