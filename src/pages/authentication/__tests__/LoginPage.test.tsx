import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { LoginPage } from "../LoginPage"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"

// Mock the hooks
vi.mock("../../../features/authentication/hooks/usePageLogin", () => ({
  usePageLogin: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    errorMessage: null,
    clearError: vi.fn(),
  })),
}))

vi.mock("../../../store/profile", () => ({
  useGetUserProfileQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: undefined,
  })),
}))

// Create a minimal store
const createMockStore = () =>
  configureStore({
    reducer: {
      // Add minimal reducers as needed
    },
  })

describe("LoginPage", () => {
  it("renders the login page with FormPageLayout", () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>,
    )

    // Check that the sign in title is present
    expect(screen.getByText(/sign in to sc market/i)).toBeInTheDocument()
  })

  it("uses FormPageLayout with minimal layout configuration", () => {
    const store = createMockStore()

    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>,
    )

    // Verify the page structure exists
    expect(container.querySelector("main")).toBeInTheDocument()
  })
})
