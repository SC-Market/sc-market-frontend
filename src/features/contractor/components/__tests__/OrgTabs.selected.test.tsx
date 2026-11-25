/**
 * Regression: with no recruiting post the Recruiting tab isn't rendered, and
 * MUI's implicit child-order values gave Reviews value 4 while useOrgTab
 * says 5, so /contractor/X/reviews highlighted no tab.
 */
import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const { OrgTabs } = await import("../OrgTabs")
const { useOrgTab } = await import("../../hooks/useOrgTab")

function Harness(props: { hasRecruitingPost: boolean }) {
  const page = useOrgTab()
  return (
    <OrgTabs
      spectrumId="ITCN"
      currentTab={page}
      hasRecruitingPost={props.hasRecruitingPost}
    />
  )
}

function selectedHref(path: string, hasRecruitingPost: boolean) {
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/contractor/:contractor_id/:tab?"
          element={<Harness hasRecruitingPost={hasRecruitingPost} />}
        />
      </Routes>
    </MemoryRouter>,
  )
  const selected = screen
    .getAllByRole("tab")
    .filter((tab) => tab.getAttribute("aria-selected") === "true")
  const hrefs = selected.map((tab) => tab.getAttribute("href"))
  view.unmount()
  return hrefs
}

describe("OrgTabs: each tab path selects its tab", () => {
  for (const hasRecruitingPost of [false, true]) {
    const tabs = ["about", "order", "members", "reviews"].concat(
      hasRecruitingPost ? ["recruiting"] : [],
    )
    it(`with${hasRecruitingPost ? "" : "out"} a recruiting post`, () => {
      expect(selectedHref("/contractor/ITCN", hasRecruitingPost)).toEqual([
        expect.stringMatching(/\/ITCN$/),
      ])
      for (const tab of tabs) {
        expect(
          selectedHref(`/contractor/ITCN/${tab}`, hasRecruitingPost),
        ).toEqual([expect.stringMatching(new RegExp(`/ITCN/${tab}$`))])
      }
    })
  }
})
