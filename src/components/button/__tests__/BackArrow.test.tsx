import { vi } from "vitest"
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { BackArrow } from "../BackArrow"

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_: string, fallback?: string) => fallback || "",
  }),
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe("BackArrow", () => {
  it("renders and triggers navigate(-1) on click", async () => {
    const { MemoryRouter } = await import("react-router-dom")
    
    render(
      <MemoryRouter>
        <BackArrow />
      </MemoryRouter>,
    )

    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
