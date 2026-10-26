import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { AdminTestAccountsView } from "../AdminTestAccountsView"

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  state: { data: undefined as unknown, isLoading: false, error: undefined as unknown },
}))

vi.mock("../../../store/api/v2/market", () => ({
  useListTestAccountsQuery: () => ({ data: { login_enabled: false, accounts: [] }, isLoading: false }),
  useCreateTestAccountMutation: () => [
    mocks.create,
    { ...mocks.state, reset: () => { mocks.state.data = undefined } },
  ],
  useDeleteTestAccountMutation: () => [vi.fn(), { isLoading: false }],
}))

const created = (name: string) => ({
  user_id: name,
  username: `~${name}`,
  display_name: name,
  otpauth_uri: `otpauth://totp/SC%20Market:~${name}?secret=JBSWY3DPEHPK3PXP`,
  secret: "JBSWY3DPEHPK3PXP",
  manual_key: "JBSW Y3DP EHPK 3PXP",
  qr_data_url: "data:image/svg+xml;base64,xx",
})

/** jsdom's Blob has no text(). */
const readBlob = (b: Blob) =>
  new Promise<string>((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.readAsText(b)
  })

async function createAccount(rerender: (ui: React.ReactElement) => void, name: string) {
  mocks.create.mockImplementationOnce(async () => {
    mocks.state.data = created(name)
    return { data: created(name) }
  })
  fireEvent.change(screen.getByTestId("test-account-username"), { target: { value: name } })
  fireEvent.change(screen.getByTestId("test-account-display-name"), { target: { value: name } })
  await act(async () => {
    fireEvent.submit(screen.getByTestId("test-account-username").closest("form")!)
  })
  rerender(<AdminTestAccountsView />)
}

describe("AdminTestAccountsView credentials download", () => {
  let blobs: Blob[]
  let revoked: string[]

  beforeEach(() => {
    blobs = []
    revoked = []
    mocks.state.data = undefined
    mocks.create.mockReset()
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b)
      return `blob:${blobs.length}`
    })
    URL.revokeObjectURL = vi.fn((u: string) => {
      revoked.push(u)
    })
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("downloads the agents' credentials format and revokes the Blob URL", async () => {
    const { rerender } = render(<AdminTestAccountsView />)
    await createAccount(rerender, "test-buyer")
    expect(mocks.create).toHaveBeenCalledWith({
      createTestAccountRequest: { username: "test-buyer", display_name: "test-buyer" },
    })
    expect(screen.getAllByText(/chmod 600/).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByTestId("download-test-account-credentials"))
    expect(JSON.parse(await readBlob(blobs[0]))).toEqual({
      "~test-buyer": {
        username: "~test-buyer",
        secret: "JBSWY3DPEHPK3PXP",
        otpauth_uri: created("test-buyer").otpauth_uri,
      },
    })
    expect(revoked).toEqual(["blob:1"])
  })

  it("offers everything created this session in one file", async () => {
    const { rerender } = render(<AdminTestAccountsView />)
    await createAccount(rerender, "test-buyer")
    fireEvent.click(screen.getByText("I saved it"))
    rerender(<AdminTestAccountsView />)
    await createAccount(rerender, "test-seller")
    await waitFor(() => expect(screen.getByTestId("download-all-test-account-credentials")).toBeInTheDocument())
    fireEvent.click(screen.getByTestId("download-all-test-account-credentials"))
    expect(Object.keys(JSON.parse(await readBlob(blobs[0]))).sort()).toEqual(["~test-buyer", "~test-seller"])
    expect(revoked).toEqual(["blob:1"])
  })
})
