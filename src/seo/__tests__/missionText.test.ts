import { describe, it, expect } from "vitest"
import {
  gameDataFreshness,
  missionDisplayTitle,
  missionSummary,
  readableMissionText,
} from "../missionText"
import type { MissionDetailResponse } from "../../store/api/v2/market"

describe("readableMissionText", () => {
  it("turns the game's placeholders into words", () => {
    expect(readableMissionText("Alert: [LOCATION] under attack")).toBe(
      "Alert: Location under attack",
    )
    expect(readableMissionText("Kill ~mission(TargetName)")).toBe(
      "Kill Target Name",
    )
    expect(readableMissionText("From ~mission(Contractor|Foo)", "Rayari")).toBe(
      "From Rayari",
    )
    expect(readableMissionText("From ~mission(Contractor)")).toBe(
      "From Various",
    )
    expect(readableMissionText("<em1>Hot</em1> line\\nnext")).toBe(
      "Hot line\nnext",
    )
  })
})

const mission = {
  mission_name: "Additional Resources For Research",
  mission_giver_org: "Rayari Incorporated",
  faction: "Rayari Incorporated",
  category: "collection",
  star_system: null,
  reputation_reward: 200,
  reputation_reward_faction: "Rayari Incorporated",
}

describe("missionDisplayTitle", () => {
  it("adds the giver and type, so same-name missions differ", () => {
    expect(missionDisplayTitle(mission as never)).toBe(
      "Additional Resources For Research (Rayari Incorporated, Collection)",
    )
  })
})

describe("missionSummary", () => {
  it("is one quotable sentence with giver, pay and blueprint odds", () => {
    const data = {
      mission,
      blueprint_rewards: [
        {
          pool_chance: 0.25,
          blueprints: [{ drop_probability: 3.57 }, { drop_probability: 50 }],
        },
      ],
    } as unknown as MissionDetailResponse
    expect(missionSummary(data)).toBe(
      "Additional Resources For Research is a Collection Star Citizen mission from Rayari Incorporated that pays 200 reputation with Rayari Incorporated, with 2 possible blueprint rewards (best chance 13% per completion).",
    )
  })
})

describe("gameDataFreshness", () => {
  it("states the LIVE build and import date", () => {
    expect(
      gameDataFreshness({
        version_number: "4.10.2-LIVE.12881860",
        last_data_update: "2026-10-24T07:55:26.639Z",
      }),
    ).toBe(
      "Data from Star Citizen 4.10.2 LIVE, updated 24 Oct 2026, from game files",
    )
    expect(gameDataFreshness(null)).toBeNull()
  })
})
