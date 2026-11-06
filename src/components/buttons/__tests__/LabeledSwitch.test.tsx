import { vi } from "vitest"
import React, { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LabeledSwitch } from "../LabeledSwitch"

function Harness(props: Partial<React.ComponentProps<typeof LabeledSwitch>>) {
  const [checked, setChecked] = useState(false)
  return (
    <LabeledSwitch
      label="Listed"
      checked={checked}
      onChange={setChecked}
      {...props}
    />
  )
}

describe("LabeledSwitch", () => {
  it("is named by its label, and clicking the label toggles it", async () => {
    render(<Harness />)
    const sw = screen.getByRole("checkbox", { name: "Listed" })
    expect(sw).not.toBeChecked()
    await userEvent.click(screen.getByText("Listed"))
    expect(sw).toBeChecked()
  })

  it("passes the new value to onChange", async () => {
    const onChange = vi.fn()
    render(<LabeledSwitch label="Active" checked onChange={onChange} />)
    await userEvent.click(screen.getByRole("checkbox", { name: "Active" }))
    expect(onChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it("helper text describes the switch without joining its name", () => {
    render(<Harness helperText="Listed stock appears in public listings" />)
    const sw = screen.getByRole("checkbox", { name: "Listed" })
    expect(sw).toHaveAccessibleDescription(
      "Listed stock appears in public listings",
    )
  })

  it("links an outside description through describedBy", () => {
    render(
      <>
        <Harness describedBy="why" />
        <p id="why">Only verified shops can be listed</p>
      </>,
    )
    expect(
      screen.getByRole("checkbox", { name: "Listed" }),
    ).toHaveAccessibleDescription("Only verified shops can be listed")
  })

  it("ariaLabel overrides the visible label as the name", () => {
    render(<Harness ariaLabel="Contract alerts for Personal" />)
    expect(
      screen.getByRole("checkbox", { name: "Contract alerts for Personal" }),
    ).toBeInTheDocument()
  })

  it("a hidden label still names the switch", () => {
    render(<Harness hideLabel label="Status" />)
    expect(screen.getByRole("checkbox", { name: "Status" })).toBeInTheDocument()
  })

  it("disabled switches don't toggle", async () => {
    render(<Harness disabled />)
    const sw = screen.getByRole("checkbox", { name: "Listed" })
    expect(sw).toBeDisabled()
    await userEvent.click(screen.getByText("Listed"))
    expect(sw).not.toBeChecked()
  })
})
