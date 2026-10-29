import React from "react"
import { render, screen, fireEvent, act, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AdminIdentityView } from "../AdminIdentityView"
import type { IdentityDetail, IdentitySearchRow } from "../../../store/api/v2/market"

const USER_ID = "11111111-2222-4333-8444-555555555555"

const row = (over: Partial<IdentitySearchRow> = {}): IdentitySearchRow => ({
  user_id: USER_ID,
  username: "StaleHandle",
  display_name: "StaleHandle",
  role: "user",
  rsi_confirmed: true,
  spectrum_user_id: "7001",
  discord_provider_id: "900000000000000001",
  discord_id_column: "900000000000000001",
  banned: false,
  is_test: false,
  is_tombstone: false,
  deletion_pending: false,
  ...over,
})

const detail = (over: Partial<IdentityDetail> = {}): IdentityDetail => ({
  ...row(),
  created_at: "2026-01-01T00:00:00.000Z",
  deleted_at: null,
  deletion_scheduled_at: null,
  discord_column_stale: false,
  providers: [
    {
      provider_type: "discord",
      provider_id: "900000000000000001",
      provider_username: "stale#1",
      is_primary: true,
      linked_at: "2026-01-01T00:00:00.000Z",
      last_used_at: "2026-10-01T00:00:00.000Z",
    },
  ],
  sessions: [{ refreshed_at: "2026-10-27T00:00:00.000Z", expires_at: "2026-12-01T00:00:00.000Z", user_agent: "UA-1" }],
  username_twins: [{ user_id: "other", username: "stalehandle" }],
  recent_actions: [
    {
      audit_log_id: "a1",
      kind: "spectrum_set",
      actor_user_id: "admin",
      actor_username: "boss",
      reason: "fixing a missing id",
      created_at: "2026-10-20T00:00:00.000Z",
    },
  ],
  ...over,
})

type MutationState = { isLoading: boolean; error?: unknown; reset: () => void }

const m = vi.hoisted(() => ({
  searchArgs: [] as unknown[],
  search: { data: undefined as unknown, isFetching: false, error: undefined as unknown },
  user: { data: undefined as unknown, isLoading: false, error: undefined as unknown },
  calls: {} as Record<string, unknown[]>,
  errors: {} as Record<string, unknown>,
}))

function mutation(name: string): () => [(arg: unknown) => Promise<unknown>, MutationState] {
  return () => [
    async (arg: unknown) => {
      ;(m.calls[name] ||= []).push(arg)
      if (m.errors[name]) return { error: m.errors[name] }
      return { data: { audit_log_id: "audit-9", kind: name === "release" ? "username_released" : "discord_unlinked", user: detail() } }
    },
    { isLoading: false, error: m.errors[name], reset: () => {} },
  ]
}

vi.mock("../../../store/api/v2/market", () => ({
  useSearchIdentityUsersQuery: (arg: unknown, opts: { skip?: boolean }) => {
    if (!opts?.skip) m.searchArgs.push(arg)
    return opts?.skip ? { data: undefined, isFetching: false } : m.search
  },
  useGetIdentityUserQuery: () => m.user,
  useReleaseIdentityUsernameMutation: mutation("release"),
  useUnlinkIdentityDiscordMutation: mutation("unlink"),
  useFixIdentitySpectrumMutation: mutation("spectrum"),
  useDeactivateIdentityUserMutation: mutation("deactivate"),
  useReactivateIdentityUserMutation: mutation("reactivate"),
}))

beforeEach(() => {
  m.searchArgs.length = 0
  m.search = { data: { users: [row()] }, isFetching: false, error: undefined }
  m.user = { data: detail(), isLoading: false, error: undefined }
  m.calls = {}
  m.errors = {}
})

async function openUser() {
  render(<AdminIdentityView />)
  fireEvent.change(screen.getByTestId("identity-search"), { target: { value: "  stale " } })
  await act(async () => {
    fireEvent.submit(screen.getByTestId("identity-search").closest("form")!)
  })
  fireEvent.click(screen.getByTestId(`identity-row-${USER_ID}`))
  return screen.getByTestId("identity-user-panel")
}

function openAction(panel: HTMLElement, name: RegExp) {
  fireEvent.click(within(panel).getByRole("button", { name }))
  return screen.getByRole("dialog")
}

async function confirm(dialog: HTMLElement) {
  await act(async () => {
    fireEvent.click(within(dialog).getByTestId("identity-confirm"))
  })
}

describe("AdminIdentityView", () => {
  it("searches with the trimmed query and shows the selected account's identities", async () => {
    const panel = await openUser()
    expect(m.searchArgs[m.searchArgs.length - 1]).toEqual({ q: "stale" })
    expect(within(panel).getByTestId("identity-discord")).toHaveTextContent("900000000000000001")
    expect(within(panel).getByText("stale#1")).toBeInTheDocument()
    expect(within(panel).getByText("UA-1")).toBeInTheDocument()
    // (No i18n instance in unit tests: interpolations stay as {{...}}.)
    expect(within(panel).getByText(/Other accounts with this username in a different case/)).toBeInTheDocument()
    // Recent changes show the admin's reason (admins only).
    expect(within(panel).getByText("fixing a missing id")).toBeInTheDocument()
  })

  it("needs at least 2 characters to search", () => {
    render(<AdminIdentityView />)
    fireEvent.change(screen.getByTestId("identity-search"), { target: { value: "a" } })
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled()
  })

  it("release username: a reason of 5+ characters is required, then the mutation runs", async () => {
    const panel = await openUser()
    const dialog = openAction(panel, /release username/i)
    const confirmButton = within(dialog).getByTestId("identity-confirm")
    expect(confirmButton).toBeDisabled()
    fireEvent.change(within(dialog).getByTestId("identity-reason"), { target: { value: "abc" } })
    expect(confirmButton).toBeDisabled()
    fireEvent.change(within(dialog).getByTestId("identity-reason"), { target: { value: "  stale holder, ticket 42 " } })
    expect(confirmButton).toBeEnabled()
    await confirm(dialog)
    expect(m.calls.release).toEqual([{ userId: USER_ID, identityActionRequest: { reason: "stale holder, ticket 42" } }])
    expect(screen.getByText(/saved, audited and the user was notified/)).toBeInTheDocument()
  })

  it("unlink Discord when it is the only login: the admin must confirm leaving no login", async () => {
    const panel = await openUser()
    const dialog = openAction(panel, /unlink discord/i)
    fireEvent.change(within(dialog).getByTestId("identity-reason"), { target: { value: "Discord belongs to someone else" } })
    expect(within(dialog).getByTestId("identity-confirm")).toBeDisabled()
    fireEvent.click(within(dialog).getByRole("checkbox"))
    await confirm(dialog)
    expect(m.calls.unlink).toEqual([
      { userId: USER_ID, unlinkDiscordRequest: { reason: "Discord belongs to someone else", allow_no_login: true } },
    ])
  })

  it("unlink Discord with another login: no confirmation needed", async () => {
    m.user.data = detail({
      providers: [...detail().providers, { ...detail().providers[0], provider_type: "citizenid", provider_id: "cid", is_primary: false }],
    })
    const panel = await openUser()
    const dialog = openAction(panel, /unlink discord/i)
    expect(within(dialog).queryByRole("checkbox")).toBeNull()
    fireEvent.change(within(dialog).getByTestId("identity-reason"), { target: { value: "requested by owner" } })
    await confirm(dialog)
    expect(m.calls.unlink).toEqual([{ userId: USER_ID, unlinkDiscordRequest: { reason: "requested by owner", allow_no_login: false } }])
  })

  it("fix Spectrum: set needs a numeric id", async () => {
    const panel = await openUser()
    const dialog = openAction(panel, /fix spectrum link/i)
    fireEvent.click(within(dialog).getByLabelText("Set"))
    fireEvent.change(within(dialog).getByTestId("identity-reason"), { target: { value: "id was missing" } })
    fireEvent.change(within(dialog).getByTestId("identity-spectrum-id"), { target: { value: "12ab" } })
    expect(within(dialog).getByTestId("identity-confirm")).toBeDisabled()
    fireEvent.change(within(dialog).getByTestId("identity-spectrum-id"), { target: { value: "8123" } })
    await confirm(dialog)
    expect(m.calls.spectrum).toEqual([
      { userId: USER_ID, spectrumFixRequest: { reason: "id was missing", mode: "set", spectrum_user_id: "8123" } },
    ])
  })

  it("deactivate / reactivate follow the account state", async () => {
    const panel = await openUser()
    expect(within(panel).queryByRole("button", { name: /reactivate/i })).toBeNull()
    const dialog = openAction(panel, /deactivate account/i)
    fireEvent.change(within(dialog).getByTestId("identity-reason"), { target: { value: "compromised account" } })
    await confirm(dialog)
    expect(m.calls.deactivate).toEqual([{ userId: USER_ID, identityActionRequest: { reason: "compromised account" } }])
  })

  it("shows the server's refusal in the dialog", async () => {
    m.errors.spectrum = {
      status: 409,
      data: { error: { code: "CONFLICT", message: "Another account holds this Spectrum id. Clear it there first; ids are never moved." } },
    }
    const panel = await openUser()
    const dialog = openAction(panel, /fix spectrum link/i)
    expect(within(dialog).getByText(/Another account holds this Spectrum id/)).toBeInTheDocument()
  })

  it("site admins, test accounts and deleted accounts can't be changed", async () => {
    m.user.data = detail({ role: "admin" })
    const panel = await openUser()
    for (const name of [/release username/i, /unlink discord/i, /fix spectrum link/i, /deactivate account/i]) {
      expect(within(panel).getByRole("button", { name })).toBeDisabled()
    }
    expect(within(panel).getByText(/can't be changed here/)).toBeInTheDocument()
  })

  it("shows reactivate for a deactivated account", async () => {
    m.user.data = detail({ banned: true })
    const panel = await openUser()
    expect(within(panel).getByRole("button", { name: /reactivate account/i })).toBeEnabled()
    expect(within(panel).queryByRole("button", { name: /deactivate account/i })).toBeNull()
  })
})
