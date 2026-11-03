import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { useFocusOnReveal } from "../useFocusOnReveal"

function Revealed({ enabled }: { enabled?: boolean }) {
  const [shown, setShown] = useState(false)
  const [text, setText] = useState("")
  const focusRef = useFocusOnReveal<HTMLInputElement>(enabled)
  return shown ? (
    <input
      aria-label="name"
      ref={focusRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  ) : (
    <button onClick={() => setShown(true)}>open</button>
  )
}

describe("useFocusOnReveal", () => {
  it("focuses the field when the user reveals it", () => {
    render(<Revealed />)
    fireEvent.click(screen.getByRole("button", { name: "open" }))
    expect(screen.getByRole("textbox", { name: "name" })).toHaveFocus()
  })

  it("leaves focus alone when disabled", () => {
    render(<Revealed enabled={false} />)
    fireEvent.click(screen.getByRole("button", { name: "open" }))
    expect(screen.getByRole("textbox", { name: "name" })).not.toHaveFocus()
  })
})
