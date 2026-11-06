import "../../../util/i18n"
/**
 * Blueprint and mission cards are real links (`<a href>` to the detail page,
 * rendered by the router's Link): crawlable in the prerendered /blueprints
 * and /missions hubs, reachable with Tab, and Ctrl/Cmd/middle-click open the
 * page in a new tab. A plain left click stays in-app (the page's onClick:
 * the desktop modal) instead of following the href.
 */
import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { BlueprintCard } from "../BlueprintCard"
import { MissionCard } from "../MissionCard"

const blueprint = {
  blueprint_id: "bp-1",
  blueprint_code: "bp-code-1",
  blueprint_name: "BP_CRAFT_behr_lmg_ballistic_01",
  output_item_name: "FS-9 LMG",
  item_category: "Weapons",
  ingredient_count: 1,
  ingredients: [{ name: "Agricium", quantity_required: 1 }],
  mission_count: 0,
  manufacturer_name: null,
}

const mission = {
  mission_id: "m-1",
  mission_code: "PU_Delivery_Local_KlimIntro",
  mission_name: "A Batch from Scratch",
  category: "missiontype.delivery",
  star_system: "Stanton",
  blueprint_reward_count: 0,
  is_chain_starter: false,
  is_chain_mission: false,
  is_shareable: true,
  is_unique_mission: false,
  ship_encounter_count: 0,
}

const inRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

/** The card's own link (chips inside it are buttons, not links). */
function cardLink(name: string | RegExp): HTMLAnchorElement {
  const link = screen.getByRole("link", { name })
  expect(link.tagName).toBe("A")
  return link as HTMLAnchorElement
}

describe("BlueprintCard link", () => {
  it.each(["grid", "list"] as const)(
    "%s view is an <a href> to the blueprint page",
    (viewMode) => {
      inRouter(<BlueprintCard blueprint={blueprint} viewMode={viewMode} />)
      const link = cardLink(/FS-9 LMG/)
      expect(link.getAttribute("href")).toBe(
        "/blueprints/BP_CRAFT_behr_lmg_ballistic_01",
      )
      // Keyboard reachable: an anchor with an href, not taken out of the tab order.
      expect(link.getAttribute("tabindex")).not.toBe("-1")
    },
  )

  it("a plain click opens in-app; a modified or middle click follows the link", () => {
    const onClick = vi.fn()
    inRouter(
      <BlueprintCard blueprint={blueprint} viewMode="grid" onClick={onClick} />,
    )
    const link = cardLink(/FS-9 LMG/)

    const plain = fireEvent.click(link)
    expect(plain).toBe(false) // default prevented: the modal, not a page load
    expect(onClick).toHaveBeenCalledWith(
      "bp-1",
      "BP_CRAFT_behr_lmg_ballistic_01",
    )

    onClick.mockClear()
    for (const init of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { button: 1 },
    ]) {
      fireEvent.click(link, init)
    }
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe("MissionCard link", () => {
  it("is an <a href> to the mission page", () => {
    inRouter(
      <MissionCard
        mission={mission}
        href="/missions/PU_Delivery_Local_KlimIntro"
      />,
    )
    const link = cardLink(/A Batch from Scratch/)
    expect(link.getAttribute("href")).toBe(
      "/missions/PU_Delivery_Local_KlimIntro",
    )
    expect(link.getAttribute("tabindex")).not.toBe("-1")
  })

  it("a plain click opens in-app; Ctrl-click follows the link", () => {
    const onClick = vi.fn()
    inRouter(
      <MissionCard
        mission={mission}
        href="/missions/PU_Delivery_Local_KlimIntro"
        onClick={onClick}
      />,
    )
    const link = cardLink(/A Batch from Scratch/)
    expect(fireEvent.click(link)).toBe(false)
    expect(onClick).toHaveBeenCalledWith("m-1")
    onClick.mockClear()
    fireEvent.click(link, { ctrlKey: true })
    expect(onClick).not.toHaveBeenCalled()
  })

  it("a chip inside the card doesn't follow the card's link", () => {
    inRouter(
      <MissionCard
        mission={mission}
        href="/missions/PU_Delivery_Local_KlimIntro"
      />,
    )
    const chip = screen.getByRole("button", { name: "Stanton" })
    expect(fireEvent.click(chip)).toBe(false)
  })
})
