import "../../../../util/i18n"
import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { describe, it, expect, vi } from "vitest"
import { GameItemSearchAutocomplete } from "../GameItemSearchAutocomplete"
import { marketV2Api } from "../../../../store/api/v2/market"

const createStore = () =>
  configureStore({
    reducer: { [marketV2Api.reducerPath]: marketV2Api.reducer },
    middleware: (getDefault) => getDefault().concat(marketV2Api.middleware),
  })

function renderField(value: string | null) {
  const store = createStore()
  const onChange = vi.fn()
  const ui = (v: string | null) => (
    <Provider store={store}>
      <GameItemSearchAutocomplete value={v} onChange={onChange} label="Item" />
    </Provider>
  )
  const result = render(ui(value))
  return {
    ...result,
    onChange,
    setValue: (v: string | null) => result.rerender(ui(v)),
  }
}

describe("GameItemSearchAutocomplete", () => {
  it("shows the item named by value on first render", () => {
    renderField("Aurora MR")
    expect(screen.getByRole("combobox")).toHaveValue("Aurora MR")
  })

  it("updates when the value changes", () => {
    const { setValue } = renderField("Aurora MR")
    setValue("Cutlass Black")
    expect(screen.getByRole("combobox")).toHaveValue("Cutlass Black")
    setValue(null)
    expect(screen.getByRole("combobox")).toHaveValue("")
  })

  it("keeps what the user types while value is unchanged", () => {
    const { setValue, onChange } = renderField("Aurora MR")
    const box = screen.getByRole("combobox")
    fireEvent.change(box, { target: { value: "Cut" } })
    expect(box).toHaveValue("Cut")
    setValue("Aurora MR")
    expect(box).toHaveValue("Cut")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("starts empty without a value", () => {
    renderField(null)
    expect(screen.getByRole("combobox")).toHaveValue("")
  })

  it("offers what was typed as a custom item when asked to", () => {
    const store = createStore()
    const onChange = vi.fn()
    const onCustomItem = vi.fn()
    render(
      <Provider store={store}>
        <GameItemSearchAutocomplete
          value={null}
          onChange={onChange}
          onCustomItem={onCustomItem}
          label="Item"
        />
      </Provider>,
    )
    const box = screen.getByRole("combobox")
    fireEvent.change(box, { target: { value: "Verdict LMG" } })
    fireEvent.click(
      screen.getByRole("option", {
        name: /List "Verdict LMG" as a custom item/,
      }),
    )
    expect(onCustomItem).toHaveBeenCalledWith("Verdict LMG")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("has no custom-item option unless asked to", () => {
    renderField(null)
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Verdict LMG" },
    })
    expect(screen.queryByText(/as a custom item/)).toBeNull()
  })
})
