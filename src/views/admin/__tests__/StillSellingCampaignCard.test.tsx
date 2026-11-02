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
  useSendStillSellingTestDmMutation: vi.fn(),
}))

import { StillSellingCampaignCard } from "../StillSellingCampaignCard"

const mockQuery = vi.mocked(marketApi.useGetStillSellingCampaignQuery)
const send = vi.fn()
const stop = vi.fn()
const refetch = vi.fn()
const sendTest = vi.fn()

const dryRun = (
  over: Partial<StillSellingDryRun> = {},
): StillSellingDryRun => ({
  campaign: "still_selling_2026_11",
  kill_switch_env: "STILL_SELLING_CAMPAIGN_ENABLED",
  enabled: false,
  recipients: 42,
  sellers: 40,
  listings: 130,
  listing_age: { days_30_60: 50, days_60_90: 30, days_90_plus: 50 },
  max_recipients: 150,
  max_recipients_env: "STILL_SELLING_MAX_RECIPIENTS",
  over_cap: false,
  feedback: {
    real: {
      responses: 2,
      reasons: {
        ...{
          not_playing: 0,
          waiting_patch: 0,
          not_enough_buyers: 0,
          selling_elsewhere: 0,
          too_much_work: 0,
          about_sc_market: 0,
          other: 0,
        },
        not_enough_buyers: 2,
      },
      texts: [
        {
          created_at: "2026-11-03T10:00:00.000Z",
          display_name: "Trader Joe",
          action: "keep",
          field: "easier",
          text: "Bulk edit please",
        },
      ],
    },
    test: {
      responses: 1,
      reasons: {
        ...{
          not_playing: 0,
          waiting_patch: 0,
          not_enough_buyers: 0,
          selling_elsewhere: 0,
          too_much_work: 0,
          about_sc_market: 0,
          other: 0,
        },
        other: 1,
      },
      texts: [],
    },
  },
  top_recipients: [
    { display_name: "Big Seller", listings: 25 },
    { display_name: "Small Seller", listings: 3 },
  ],
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
  vi.mocked(marketApi.useSendStillSellingTestDmMutation).mockReturnValue([
    sendTest,
    { isLoading: false, isError: false, data: undefined },
  ] as unknown as ReturnType<
    typeof marketApi.useSendStillSellingTestDmMutation
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

  it("shows sellers, listings by age and the largest recipients", () => {
    state(dryRun())
    render(<StillSellingCampaignCard />)
    expect(screen.getByTestId("still-selling-breakdown")).toHaveTextContent(
      "40 sellers. Listings not updated for 30–60 days: 50, 60–90 days: 30, 90+ days: 50.",
    )
    const top = within(screen.getByTestId("still-selling-top"))
    expect(top.getByText("Big Seller · 25")).toBeInTheDocument()
    expect(
      screen.queryByTestId("still-selling-over-cap"),
    ).not.toBeInTheDocument()
  })

  it("over the cap: warns and Send is disabled even with the switch on", () => {
    state(dryRun({ enabled: true, recipients: 900, over_cap: true }))
    render(<StillSellingCampaignCard />)
    expect(screen.getByTestId("still-selling-over-cap")).toHaveTextContent(
      "900 people are eligible, more than the cap of 150",
    )
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("shows feedback counts and text; test answers apart", () => {
    state(dryRun())
    render(<StillSellingCampaignCard />)
    expect(screen.getByText("Feedback: 2 answers")).toBeInTheDocument()
    const real = within(screen.getByTestId("still-selling-feedback-real"))
    expect(real.getByText("Not enough buyers")).toBeInTheDocument()
    expect(real.getByText(/Trader Joe/)).toHaveTextContent(
      "Would make selling easier: Bulk edit please",
    )
    expect(
      screen.getByText("From test links (not counted above): 1 answer"),
    ).toBeInTheDocument()
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

  it("Send test DM to me: works with the switch off, after a confirm step, in the picked language", () => {
    state(dryRun({ enabled: false }))
    render(<StillSellingCampaignCard />)
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    const testButton = screen.getByRole("button", {
      name: "Send test DM to me",
    })
    expect(testButton).toBeEnabled()
    fireEvent.click(testButton)
    expect(sendTest).not.toHaveBeenCalled()
    expect(screen.getByText("Send a test DM to yourself?")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Send it to me" }))
    expect(sendTest).toHaveBeenCalledWith({
      stillSellingTestRequest: { locale: "en" },
    })
    expect(send).not.toHaveBeenCalled()
  })
})
