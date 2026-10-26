import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  FILTER_DEBOUNCE_MS,
  useAutoApplySearchParams,
} from "../useAutoApplySearchParams"

/** Records every location the router commits (action + search). */
function LocationLog({ log }: { log: string[] }) {
  const location = useLocation()
  const action = useNavigationType()
  React.useEffect(() => {
    log.push(`${action} ${location.search}`)
  }, [location, action, log])
  return null
}

function Filters() {
  const filters = useAutoApplySearchParams()
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate(-1)}>back</button>
      <input aria-label="text" {...filters.bindText("text")} />
      <input aria-label="price_min" {...filters.bindText("price_min")} />
      <select
        aria-label="pickup"
        value={filters.applied("pickup_method")}
        onChange={(e) => filters.setNow({ pickup_method: e.target.value })}
      >
        <option value="">Any</option>
        <option value="delivery">Delivery</option>
      </select>
    </>
  )
}

function setup(initial: string | string[] = "/market") {
  const log: string[] = []
  const entries = Array.isArray(initial) ? initial : [initial]
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <LocationLog log={log} />
      <Filters />
    </MemoryRouter>,
  )
  // Drop the initial location; tests assert on what the filters applied.
  const applies = () => log.slice(1)
  return { applies }
}

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe("useAutoApplySearchParams", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("typing several characters applies once, after the delay", () => {
    const { applies } = setup()
    for (const v of ["l", "la", "las", "lase", "laser"]) {
      type("text", v)
      advance(100)
    }
    expect(applies()).toEqual([])
    // the input shows the draft while waiting
    expect(screen.getByLabelText("text")).toHaveValue("laser")

    advance(FILTER_DEBOUNCE_MS)
    expect(applies()).toEqual(["PUSH ?text=laser&page=1"])
  })

  it("a select change applies immediately", () => {
    const { applies } = setup()
    fireEvent.change(screen.getByLabelText("pickup"), {
      target: { value: "delivery" },
    })
    expect(applies()).toEqual(["PUSH ?pickup_method=delivery&page=1"])
  })

  it("Enter applies immediately", () => {
    const { applies } = setup()
    type("text", "rifle")
    fireEvent.keyDown(screen.getByLabelText("text"), { key: "Enter" })
    expect(applies()).toEqual(["PUSH ?text=rifle&page=1"])
    // and the pending debounce doesn't fire a second time
    advance(FILTER_DEBOUNCE_MS * 2)
    expect(applies()).toHaveLength(1)
  })

  it("does not apply when the value is unchanged", () => {
    const { applies } = setup("/market?text=laser&page=3")
    // edit and revert within the delay
    type("text", "lase")
    type("text", "laser")
    advance(FILTER_DEBOUNCE_MS)
    // Enter / blur with nothing changed
    fireEvent.keyDown(screen.getByLabelText("text"), { key: "Enter" })
    fireEvent.blur(screen.getByLabelText("text"))
    expect(applies()).toEqual([])
  })

  it("compares against legacy alias params and drops the alias on write", () => {
    const { applies } = setup("/market?query=laser&minCost=5")
    expect(screen.getByLabelText("text")).toHaveValue("laser")
    type("text", "laser")
    advance(FILTER_DEBOUNCE_MS)
    expect(applies()).toEqual([])

    type("price_min", "10")
    advance(FILTER_DEBOUNCE_MS)
    expect(applies()).toEqual(["PUSH ?query=laser&price_min=10&page=1"])
  })

  it("collapses a pending text change and a select change into one apply", () => {
    const { applies } = setup()
    type("price_min", "100")
    advance(100)
    fireEvent.change(screen.getByLabelText("pickup"), {
      target: { value: "delivery" },
    })
    advance(FILTER_DEBOUNCE_MS * 2)
    expect(applies()).toEqual([
      "PUSH ?price_min=100&pickup_method=delivery&page=1",
    ])
  })

  it("a typing burst pushes one history entry and replaces it afterwards", () => {
    const { applies } = setup()
    type("text", "las")
    advance(FILTER_DEBOUNCE_MS)
    type("text", "laser")
    advance(FILTER_DEBOUNCE_MS)
    // Enter after the burst replaces too, then the burst is over
    type("text", "laser rifle")
    fireEvent.keyDown(screen.getByLabelText("text"), { key: "Enter" })
    type("text", "pistol")
    advance(FILTER_DEBOUNCE_MS)
    expect(applies()).toEqual([
      "PUSH ?text=las&page=1",
      "REPLACE ?text=laser&page=1",
      "REPLACE ?text=laser+rifle&page=1",
      "PUSH ?text=pistol&page=1",
    ])
  })

  it("resets pagination when a filter changes", () => {
    const { applies } = setup("/market?index=4&page=4")
    type("price_min", "1")
    advance(FILTER_DEBOUNCE_MS)
    expect(applies()).toEqual(["PUSH ?page=1&price_min=1"])
  })

  it("back/forward wins over a pending draft", () => {
    const { applies } = setup(["/market?text=a", "/market?text=b"])
    type("text", "bc")
    fireEvent.click(screen.getByText("back"))
    expect(screen.getByLabelText("text")).toHaveValue("a")
    advance(FILTER_DEBOUNCE_MS * 2)
    expect(applies()).toEqual(["POP ?text=a"])
  })
})
