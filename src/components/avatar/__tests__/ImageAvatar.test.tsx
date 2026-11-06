import React from "react"
import { render, screen } from "@testing-library/react"
import { ImageAvatar } from "../ImageAvatar"

describe("ImageAvatar", () => {
  it("requires alt text (type-level)", () => {
    // @ts-expect-error alt is required
    const missingAlt = <ImageAvatar src="/a.png" />
    expect(missingAlt).toBeTruthy()
  })

  it("puts the alt text on the image", () => {
    render(<ImageAvatar src="/ship.png" alt="Avenger Titan" />)
    expect(screen.getByRole("img", { name: "Avenger Titan" })).toHaveAttribute(
      "src",
      "/ship.png",
    )
  })

  it("an empty alt marks the image decorative", () => {
    const { container } = render(<ImageAvatar src="/logo.png" alt="" />)
    expect(screen.queryByRole("img")).toBeNull()
    expect(container.querySelector("img")).toHaveAttribute("alt", "")
  })

  it("renders its children when there is no image", () => {
    render(
      <ImageAvatar alt="" variant="rounded">
        AB
      </ImageAvatar>,
    )
    expect(screen.getByText("AB")).toBeInTheDocument()
  })
})
