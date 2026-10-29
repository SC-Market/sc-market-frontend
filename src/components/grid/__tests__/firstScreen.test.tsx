import { act, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  CardStub,
  firstScreenCards,
  gridColumnsAt,
  useFirstScreenRender,
} from "../firstScreen"

const SPANS = { xs: 6, sm: 4, md: 4, lg: 2.4, xl: 2, xxl: 12 / 7, xxxl: 12 / 8 }

describe("gridColumnsAt", () => {
  it("uses the largest breakpoint at or below the width", () => {
    expect(gridColumnsAt(390, SPANS)).toBe(2)
    expect(gridColumnsAt(1440, SPANS)).toBe(5)
    expect(gridColumnsAt(1600, SPANS)).toBe(6)
    expect(gridColumnsAt(2400, SPANS)).toBe(8)
    expect(gridColumnsAt(1440, { xs: 12, lg: 6 })).toBe(2)
    expect(gridColumnsAt(390, { xs: 12, lg: 6 })).toBe(1)
  })
})

describe("firstScreenCards", () => {
  const { innerWidth, innerHeight } = window
  afterEach(() => {
    Object.assign(window, { innerWidth, innerHeight })
  })

  it("is columns x the rows that fit the viewport height", () => {
    Object.assign(window, { innerWidth: 1440, innerHeight: 900 })
    // 5 columns, ceil(900 / 308) = 3 rows; priority = the first 2 rows.
    expect(firstScreenCards(SPANS, 308)).toEqual({
      count: 15,
      priorityCount: 10,
    })
    Object.assign(window, { innerWidth: 390, innerHeight: 844 })
    expect(firstScreenCards(SPANS, 308)).toEqual({ count: 6, priorityCount: 4 })
  })
})

function Grid({ total, first }: { total: number; first: number }) {
  const rendered = useFirstScreenRender(total, first)
  return (
    <ul>
      {Array.from({ length: total }, (_, i) => (
        <li key={i}>{i < rendered ? `card ${i}` : `stub ${i}`}</li>
      ))}
    </ul>
  )
}

describe("useFirstScreenRender", () => {
  afterEach(() => vi.useRealTimers())

  it("renders the first screen, then every card right after", async () => {
    vi.useFakeTimers()
    render(<Grid total={10} first={4} />)
    expect(screen.getAllByText(/^card/)).toHaveLength(4)
    expect(screen.getAllByText(/^stub/)).toHaveLength(6)
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(screen.getAllByText(/^card/)).toHaveLength(10)
    expect(screen.queryByText(/^stub/)).toBeNull()
  })

  it("stages only once: later results render in full at once", async () => {
    vi.useFakeTimers()
    const { rerender } = render(<Grid total={0} first={4} />)
    rerender(<Grid total={10} first={4} />)
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    rerender(<Grid total={12} first={4} />)
    expect(screen.getAllByText(/^card/)).toHaveLength(12)
  })

  it("doesn't stage a grid that fits the first screen", () => {
    render(<Grid total={3} first={4} />)
    expect(screen.getAllByText(/^card/)).toHaveLength(3)
  })
})

describe("CardStub", () => {
  it("is the card's link with its title, at the card's height", () => {
    render(
      <MemoryRouter>
        <CardStub height={300} to="/market/abc" label="Some listing" />
      </MemoryRouter>,
    )
    const link = screen.getByRole("link", { name: "Some listing" })
    expect(link.getAttribute("href")).toBe("/market/abc")
    expect(link.style.height).toBe("300px")
  })

  it("is a plain box for a card that isn't a link", () => {
    const { container } = render(<CardStub height={300} />)
    const box = container.querySelector("[data-card-stub]") as HTMLElement
    expect(box.tagName).toBe("DIV")
    expect(box.style.height).toBe("300px")
  })
})
