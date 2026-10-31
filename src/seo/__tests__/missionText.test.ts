import { describe, it, expect } from "vitest"
import type { Mission, MissionRewardPool } from "../../store/api/v2/market"
import { freshnessStamp, missionSummaryLine, missionTitle, readableMissionText } from "../missionText"

const mission = (over: Partial<Mission> = {}): Mission =>
  ({
    mission_code: "X",
    mission_name: "A Chance to Impress",
    category: "delivery",
    career_type: "Delivery",
    legal_status: "LEGAL",
    mission_giver_org: "Vaughn",
    rank_index: 0,
    star_system: "Stanton",
    credit_reward_min: 12000,
    credit_reward_max: 25000,
    ...over,
  }) as Mission

describe("missionText", () => {
  it("replaces game placeholders with readable words", () => {
    expect(readableMissionText("Active Bounty: [TARGET NAME] (ERT)")).toBe("Active Bounty: Target (ERT)")
    expect(readableMissionText("Deliver to ~mission(Destination|Address)")).toBe("Deliver to Destination")
    expect(readableMissionText("<em>Alert:</em> [LOCATION] under attack")).toBe("Alert: Location under attack")
  })

  it("disambiguates titles with giver, rank and system", () => {
    expect(missionTitle(mission())).toBe("A Chance to Impress — Vaughn, Rank 0, Stanton")
  })

  it("writes the one-line summary with the best blueprint drop", () => {
    const pools = [
      { blueprints: [{ blueprint_id: "b", output_item_name: "P8-AR Rifle", blueprint_name: "BP", drop_probability: 2.5, is_guaranteed: false }] },
    ] as unknown as MissionRewardPool[]
    expect(missionSummaryLine(mission(), pools)).toBe(
      "A Chance to Impress is a legal delivery Star Citizen mission from Vaughn in Stanton, paying 12,000–25,000 aUEC, with a 2.5% chance to drop the P8-AR Rifle blueprint.",
    )
  })

  it("stamps the data version and date", () => {
    expect(
      freshnessStamp({
        version_id: "v",
        version_type: "LIVE",
        version_number: "4.10.2-LIVE.12881860",
        is_active: true,
        last_data_update: "2026-10-24T07:55:26.639Z",
        created_at: "",
        updated_at: "",
      }),
    ).toBe("Data from Star Citizen 4.10.2 LIVE, updated 24 Oct 2026 (build 12881860).")
  })
})
