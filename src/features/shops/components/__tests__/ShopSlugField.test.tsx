/**
 * The shop slug field checks availability once typing pauses
 * (GET /shops/slug-availability, debounced), says why a slug is taken or
 * reserved, and offers the API's suggestions as chips that fill the field.
 */
import React, { useState } from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../../hooks/styles/Theme"
import english from "../../../../locales/en/english.json"
import type {
  GetShopSlugAvailabilityApiArg,
  ShopSlugAvailabilityResponse,
} from "../../../../store/api/v2/market"

const { availability, answers } = vi.hoisted(() => ({
  availability: vi.fn(),
  answers: new Map<string, ShopSlugAvailabilityResponse>(),
}))

vi.mock("../../../../store/api/v2/market", () => ({
  useGetShopSlugAvailabilityQuery: (
    arg: GetShopSlugAvailabilityApiArg,
    opts: { skip: boolean },
  ) => {
    if (opts.skip) return { data: undefined, isFetching: false }
    availability(arg)
    return { data: answers.get(arg.slug), isFetching: false }
  },
}))

// The real English strings (the test setup has no i18n instance).
vi.mock("react-i18next", async () => {
  const actual =
    await vi.importActual<typeof import("react-i18next")>("react-i18next")
  const { default: catalog } =
    await import("../../../../locales/en/english.json")
  const t = (key: string, options?: Record<string, unknown>) => {
    const value =
      key.split(".").reduce<unknown>((node, part) => {
        return node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined
      }, catalog) ?? key
    return String(value).replace(/\{\{(\w+)\}\}/g, (_, name) =>
      String(options?.[name] ?? ""),
    )
  }
  return { ...actual, useTranslation: () => ({ t, i18n: { language: "en" } }) }
})

import { ShopSlugField, SHOP_SLUG_CHECK_DELAY_MS } from "../ShopSlugField"

const strings = english.ShopSlugField

function Harness(props: {
  initial?: string
  currentSlug?: string
  contractorId?: string
  conflict?: ShopSlugAvailabilityResponse
}) {
  const [value, setValue] = useState(props.initial ?? "")
  return (
    <ThemeProvider theme={mainTheme}>
      <ShopSlugField
        value={value}
        onChange={setValue}
        currentSlug={props.currentSlug}
        contractorId={props.contractorId}
        conflict={props.conflict}
        urlPrefix="sc-market.space/shops/"
      />
    </ThemeProvider>
  )
}

const input = () => screen.getByLabelText(strings.label)
const type = (value: string) => fireEvent.change(input(), { target: { value } })
const pause = () =>
  act(() => {
    vi.advanceTimersByTime(SHOP_SLUG_CHECK_DELAY_MS)
  })

describe("ShopSlugField", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    availability.mockClear()
    answers.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("checks once typing pauses, not on every keystroke", () => {
    render(<Harness contractorId="org-1" />)
    type("ac")
    type("acm")
    type("acme")
    expect(availability).not.toHaveBeenCalled()
    expect(screen.getByText(strings.checking)).toBeInTheDocument()

    pause()
    expect(availability).toHaveBeenCalledTimes(1)
    expect(availability).toHaveBeenCalledWith({
      slug: "acme",
      contractorId: "org-1",
      shopId: undefined,
    })
  })

  it("says a free slug is available", () => {
    answers.set("rockets", {
      slug: "rockets",
      available: true,
      suggestions: [],
    })
    render(<Harness />)
    type("rockets")
    pause()
    expect(
      screen.getByText("Available: sc-market.space/shops/rockets"),
    ).toBeInTheDocument()
    expect(screen.queryByRole("group")).not.toBeInTheDocument()
  })

  it("explains a reserved slug and fills in a suggestion chip when clicked", () => {
    answers.set("acme", {
      slug: "acme",
      available: false,
      reason: "reserved_org",
      reserved_for: "ACME",
      suggestions: ["acme-2", "acme-shop"],
    })
    answers.set("acme-shop", {
      slug: "acme-shop",
      available: true,
      suggestions: [],
    })
    render(<Harness />)
    type("acme")
    pause()

    expect(
      screen.getByText("This URL is reserved for the organization ACME"),
    ).toBeInTheDocument()
    const chips = screen.getByRole("group", { name: strings.suggestions })
    expect(chips).toHaveTextContent("acme-2")

    fireEvent.click(screen.getByText("acme-shop"))
    expect(input()).toHaveValue("acme-shop")
    pause()
    expect(availability).toHaveBeenLastCalledWith(
      expect.objectContaining({ slug: "acme-shop" }),
    )
    expect(screen.queryByRole("group")).not.toBeInTheDocument()
  })

  it("names a reserved route word", () => {
    answers.set("create", {
      slug: "create",
      available: false,
      reason: "reserved_word",
      reserved_word: "create",
      suggestions: ["create-2"],
    })
    render(<Harness />)
    type("create")
    pause()
    expect(
      screen.getByText(
        `"create" is reserved by the site and can't be a shop URL`,
      ),
    ).toBeInTheDocument()
  })

  it("doesn't check the shop's own slug or one that's too short", () => {
    render(<Harness initial="my-shop" currentSlug="my-shop" />)
    pause()
    type("ab")
    pause()
    expect(availability).not.toHaveBeenCalled()
    expect(
      screen.getByText("Slug must be at least 3 characters"),
    ).toBeInTheDocument()
  })

  it("shows the suggestions a 409 from saving carried", () => {
    render(
      <Harness
        initial="contested"
        conflict={{
          slug: "contested",
          available: false,
          reason: "taken",
          suggestions: ["contested-2"],
        }}
      />,
    )
    expect(screen.getByText(strings.reason.taken)).toBeInTheDocument()
    fireEvent.click(screen.getByText("contested-2"))
    expect(input()).toHaveValue("contested-2")
  })
})
