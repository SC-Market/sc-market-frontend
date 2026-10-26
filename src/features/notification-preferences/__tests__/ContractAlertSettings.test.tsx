import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const update = vi.fn()
const data = {
  subscriptions: [{ contractor_id: "org-1", kinds: ["Escort"] }],
  scopes: [
    { contractor_id: null, name: "Personal" },
    { contractor_id: "org-1", name: "Acme" },
  ],
  kinds: ["Escort", "Transport"],
}

vi.mock("../../../store/api/v2/market", () => ({
  useGetContractAlertsQuery: () => ({ data, isLoading: false, isError: false }),
  useUpdateContractAlertMutation: () => [
    update,
    { isLoading: false, isError: false },
  ],
}))
vi.mock("../../../components/paper/Section", () => ({
  FlatSection: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

import { ContractAlertSettings } from "../components/ContractAlertSettings"

describe("ContractAlertSettings", () => {
  beforeEach(() => update.mockClear())

  it("is off for personal and on for the subscribed org", () => {
    render(<ContractAlertSettings />)
    const personal = screen.getByRole("checkbox", {
      name: "Contract alerts for Personal",
    }) as HTMLInputElement
    const org = screen.getByRole("checkbox", {
      name: "Contract alerts for Acme",
    }) as HTMLInputElement
    expect([personal.checked, org.checked]).toEqual([false, true])
  })

  it("turning personal on subscribes to every kind", () => {
    render(<ContractAlertSettings />)
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Contract alerts for Personal" }),
    )
    expect(update).toHaveBeenCalledWith({
      updateContractAlertRequest: {
        contractor_id: null,
        enabled: true,
        kinds: null,
      },
    })
  })

  it("clicking a kind adds it to the org's filter", () => {
    render(<ContractAlertSettings />)
    fireEvent.click(screen.getByText("Transport"))
    expect(update).toHaveBeenCalledWith({
      updateContractAlertRequest: {
        contractor_id: "org-1",
        enabled: true,
        kinds: ["Escort", "Transport"],
      },
    })
  })
})
