/**
 * MissionDetailContent — shared tab components used by both the modal and standalone page.
 * Exports: MissionHeaderChips, MissionTabs, and all tab content renderers.
 */

import { useState } from "react"
import { Box, Stack, Tab, Tabs } from "@mui/material"
import type {
  MissionDetailResponse,
  Mission,
} from "../../features/game-data/api/gameDataApi"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getMissionTypeLabel } from "../../util/missionDisplay"
import { getMissionIcon } from "../../util/gameIcons"
import { MissionRankCalculator } from "./MissionRankCalculator"
import { MissionTypeDetails } from "./MissionTypeDetails"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { missionGiver } from "../../seo/missionText"

import { TagChip } from "../tags/TagChip"
import { OverviewTab } from "./MissionOverviewTab"
import { RequirementsTab, ChainTab } from "./MissionRequirementsTab"

// ============================================================================
// Header Chips — shared between modal and page
// ============================================================================

export function MissionHeaderChips({ mission: m }: { mission: Mission }) {
  const { t } = useTranslation()
  // Real links (crawlable), to the mission list filtered by the chip.
  const go = (params: Record<string, string>) => ({
    clickable: true,
    component: RouterLink,
    to: `${GAME_DATA_PATHS.missions}?${new URLSearchParams(params).toString()}`,
  })
  const giver = missionGiver(m)

  // Colours come from the tag type (components/tags/tagColors).
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {m.star_system && (
        <TagChip
          tag="location"
          label={m.star_system}
          {...go({ system: m.star_system! })}
        />
      )}
      {m.category && (
        <TagChip
          tag="category"
          label={getMissionTypeLabel(m.category, t)}
          {...go({ category: m.category })}
          icon={
            getMissionIcon(m.category) ? (
              <img
                src={getMissionIcon(m.category)!}
                alt=""
                style={{ width: 16, height: 16 }}
              />
            ) : undefined
          }
        />
      )}
      {giver && <TagChip tag="faction" label={giver} {...go({ giver })} />}
      {(m.is_illegal || m.legal_status === "ILLEGAL") && (
        <TagChip
          tag="illegal"
          label={t("missionsUi.illegal")}
          {...go({ legal: "ILLEGAL" })}
        />
      )}
      {m.is_unique_mission && (
        <TagChip tag="trait" label={t("missionsUi.unique")} />
      )}
      {m.is_chain_starter && (
        <TagChip
          tag="trait"
          label={t("missionsUi.starter")}
          {...go({ chain: "true" })}
        />
      )}
      {m.is_chain_mission && !m.is_chain_starter && (
        <TagChip tag="trait" label={t("missionsUi.chain")} />
      )}
      {m.is_shareable && (
        <TagChip
          tag="trait"
          label={t("missionsUi.shareable")}
          {...go({ shareable: "true" })}
        />
      )}
      {m.associated_event && (
        <TagChip
          tag="event"
          label={m.associated_event}
          {...go({ show_events: "true", event: m.associated_event! })}
        />
      )}
      {m.difficulty_level && (
        <TagChip tag="tier" label={`D${m.difficulty_level}`} />
      )}
    </Stack>
  )
}

// ============================================================================
// Tabbed Content — renders all tabs with state management
// ============================================================================

export function MissionDetailTabs({
  data,
  onBlueprintClick,
}: {
  data: MissionDetailResponse
  onBlueprintClick?: (id: string) => void
}) {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const m = data.mission
  const hasChain = !!(
    m.is_chain_starter ||
    m.is_chain_mission ||
    data.prerequisite_missions?.length
  )

  const hasDetails = !!(
    data.ship_encounters?.length ||
    data.npc_encounters?.length ||
    data.entity_spawns?.length ||
    data.hauling_orders?.length
  )

  const tabs: { label: string; id: string }[] = [
    { label: t("gameTaxonomyUi.missionTabs.overview"), id: "overview" },
  ]
  if (hasDetails)
    tabs.push({ label: t("gameTaxonomyUi.missionTabs.details"), id: "details" })
  tabs.push({
    label: t("gameTaxonomyUi.missionTabs.requirements"),
    id: "requirements",
  })
  if (m.reward_scope)
    tabs.push({
      label: t("gameTaxonomyUi.missionTabs.rankCalculator"),
      id: "calculator",
    })
  if (hasChain)
    tabs.push({ label: t("gameTaxonomyUi.missionTabs.chainInfo"), id: "chain" })

  const activeTab = tabs[tab]?.id || "overview"

  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        {tabs.map((tb) => (
          <Tab key={tb.id} label={tb.label} />
        ))}
      </Tabs>
      {/* Every panel is in the page (the inactive ones hidden), so the HTML
          has the whole mission: rewards, requirements, cooldowns, chain. */}
      <Box sx={{ pt: 2 }}>
        <Box hidden={activeTab !== "overview"}>
          <OverviewTab data={data} onBlueprintClick={onBlueprintClick} />
        </Box>
        {hasDetails && (
          <Box hidden={activeTab !== "details"}>
            <MissionTypeDetails data={data} />
          </Box>
        )}
        <Box hidden={activeTab !== "requirements"}>
          <RequirementsTab data={data} />
        </Box>
        {activeTab === "calculator" && m.reward_scope && (
          <MissionRankCalculator
            reputationReward={m.reputation_reward || 0}
            rewardScope={m.reward_scope}
            rewardFaction={m.reputation_reward_faction}
            requiredRank={m.required_rank}
            minStanding={m.min_standing}
            isShareable={m.is_shareable}
          />
        )}
        {hasChain && (
          <Box hidden={activeTab !== "chain"}>
            <ChainTab data={data} />
          </Box>
        )}
      </Box>
    </>
  )
}
