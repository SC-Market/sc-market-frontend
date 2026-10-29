import React from "react"
import { render, screen } from "@testing-library/react"
import { StaticRatingStars } from "../StaticRatingStars"

function filledWidth(): string {
  const img = screen.getByRole("img")
  return (img.lastElementChild as HTMLElement).style.width
}

describe("StaticRatingStars", () => {
  it("labels the rating like MUI Rating", () => {
    render(<StaticRatingStars value={4.56} emptyColor="#777" />)
    expect(screen.getByRole("img", { name: "4.6 Stars" })).toBeInTheDocument()
  })

  it("uses the singular for one star and 0 for no rating", () => {
    const { rerender } = render(<StaticRatingStars value={1} emptyColor="#777" />)
    expect(screen.getByRole("img", { name: "1 Star" })).toBeInTheDocument()
    rerender(<StaticRatingStars value={0} emptyColor="#777" />)
    expect(screen.getByRole("img", { name: "0 Stars" })).toBeInTheDocument()
  })

  it("fills the stars to the rating, clamped to 0-5", () => {
    const { rerender } = render(<StaticRatingStars value={2.5} emptyColor="#777" />)
    expect(filledWidth()).toBe("50%")
    rerender(<StaticRatingStars value={7} emptyColor="#777" />)
    expect(filledWidth()).toBe("100%")
    rerender(<StaticRatingStars value={Number.NaN} emptyColor="#777" />)
    expect(filledWidth()).toBe("0%")
  })

  it("draws five stars in each layer", () => {
    const { container } = render(<StaticRatingStars value={3} emptyColor="#777" />)
    const svgs = container.querySelectorAll("svg")
    expect(svgs).toHaveLength(2)
    svgs.forEach((svg) => expect(svg.querySelectorAll("path")).toHaveLength(5))
  })
})
