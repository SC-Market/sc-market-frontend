/**
 * Unit tests for WikiShipBrowser component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { WikiShipBrowser } from "../WikiShipBrowser"
import { wikiApi } from "../../../store/wikiApi"

const createMockStore = () => {
  return configureStore({
    reducer: {
      [wikiApi.reducerPath]: wikiApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(wikiApi.middleware),
  })
}

describe("WikiShipBrowser", () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  it("renders the component with title and description", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiShipBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText("Ships Database")).toBeInTheDocument()
    expect(
      screen.getByText("Browse all ships with detailed specifications and loadouts")
    ).toBeInTheDocument()
  })

  it("renders filter controls", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiShipBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText("Manufacturer")).toBeInTheDocument()
    expect(screen.getByText("Focus")).toBeInTheDocument()
    expect(screen.getByText("Size")).toBeInTheDocument()
  })

  it("displays loading state initially", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiShipBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })
})
