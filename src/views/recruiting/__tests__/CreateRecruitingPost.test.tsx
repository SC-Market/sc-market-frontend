/**
 * A new recruiting post was created for the user's first org, not the org
 * selected in the sidebar (the one /recruiting/post/create checks Manage
 * Recruiting in). It now posts for the selected org.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { Cookies, CookiesProvider } from "react-cookie"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"

const { createPost } = vi.hoisted(() => ({ createPost: vi.fn() }))

vi.mock("../../../features/recruiting/api/recruitingApi", () => ({
  useRecruitingCreatePostMutation: () => [
    (arg: unknown) => ({
      unwrap: () => Promise.resolve(createPost(arg) ?? { post_id: "p1" }),
    }),
  ],
  useRecruitingUpdatePostMutation: () => [vi.fn()],
}))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({
    data: {
      username: "me",
      contractors: [
        { spectrum_id: "FIRSTORG", name: "First Org", roles: [] },
        { spectrum_id: "SECONDORG", name: "Second Org", roles: [] },
      ],
    },
  }),
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: (spectrumId: string, { skip }: { skip: boolean }) => ({
    data: skip ? undefined : { spectrum_id: spectrumId, name: `Org ${spectrumId}` },
    isLoading: false,
  }),
}))
vi.mock("../../../components/markdown/Markdown.lazy", () => ({
  MarkdownEditor: (props: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="body" value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  ),
}))
vi.mock("../RecruitingPostView", () => ({ RecruitingPostView: () => null }))
vi.mock("../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => vi.fn() }))

import { CreateRecruitingPost } from "../CreateRecruitingPost"

/** Render with the sidebar's selected org (the current_contractor cookie). */
function renderForm(selectedOrg: string) {
  render(
    <CookiesProvider cookies={new Cookies({ current_contractor: selectedOrg })}>
      <ThemeProvider theme={mainTheme}>
        <MemoryRouter>
          <CreateRecruitingPost />
        </MemoryRouter>
      </ThemeProvider>
    </CookiesProvider>,
  )
}

describe("CreateRecruitingPost", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("posts for the org selected in the sidebar, not the first org", async () => {
    renderForm("SECONDORG")

    expect(screen.getByText(/Posting for/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/recruiting_post.title_required|Title/), {
      target: { value: "We're hiring" },
    })
    fireEvent.change(screen.getByLabelText("body"), { target: { value: "Join us" } })
    fireEvent.click(screen.getByRole("button", { name: /recruiting_post.submit|Submit/ }))

    await waitFor(() => expect(createPost).toHaveBeenCalled())
    expect(createPost.mock.calls[0][0]).toMatchObject({
      contractor: "SECONDORG",
      title: "We're hiring",
      body: "Join us",
    })
  })

  it("can't submit without a selected org the user belongs to", () => {
    renderForm("NOTMYORG")
    const submit = screen.getByRole("button", { name: /recruiting_post.submit|Submit/ })
    expect((submit as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByText(/Posting for/)).toBeNull()
  })
})
