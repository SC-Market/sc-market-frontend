/**
 * Unit tests for WikiShipBrowser component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { WikiShipBrowser } from "../WikiShipBrowser"
import { marketV2Api } from "../../../store/api/v2/market"

const createMockStore = () => {
  return configureStore({
    reducer: {
      [marketV2Api.reducerPath]: marketV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketV2Api.middleware),
  })
}

describe("WikiShipBrowser", () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  it("renders the component with title", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiShipBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText("Ships Database")).toBeInTheDocument()
  })

  it("renders search bar", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WikiShipBrowser />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByPlaceholderText("Search ships, manufacturers, careers...")).toBeInTheDocument()
  })
})
