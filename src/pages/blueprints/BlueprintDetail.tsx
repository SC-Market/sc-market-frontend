/**
 * BlueprintDetail — standalone page for mobile
 */

import React, { useState } from "react"
import { useParams } from "react-router-dom"
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Avatar,
  Chip,
  Stack,
} from "@mui/material"
import { useGetBlueprintDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { formatCategoryName } from "../../util/categoryDisplay"

function initials(name: string | undefined): string {
  if (!name) return "?"
  return name.split(/[\s_-]+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

export function BlueprintDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: id! },
    { skip: !id },
  )
  const [tab, setTab] = useState(0)
  const bp = data?.blueprint
  const outputItem = data?.output_item
  const itemName = outputItem?.name || bp?.blueprint_name || "Blueprint"

  return (
    <StandardPageLayout
      title={itemName}
      headerTitle={itemName}
      breadcrumbs={[
        { label: "Blueprints", href: "/blueprints" },
        { label: itemName },
      ]}
      isLoading={isLoading}
      error={error ? "not_found" : undefined}
      sidebarOpen={true}
      maxWidth="md"
    >
      {data && bp && (
        <>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, px: 2 }}>
            <Avatar
              src={outputItem?.icon_url || bp.icon_url}
              variant="rounded"
              sx={{ width: 56, height: 56, fontSize: "1.2rem", bgcolor: "primary.main" }}
              imgProps={{ style: { objectFit: "contain" } }}
            >
              {initials(itemName)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>{itemName}</Typography>
              <Stack direction="row" spacing={0.5}>
                {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" />}
                {bp.tier && <Chip label={`Tier ${bp.tier}`} size="small" color="secondary" />}
                {bp.item_category && <Chip label={formatCategoryName(bp.item_category)} size="small" variant="outlined" />}
              </Stack>
            </Box>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Ingredients" />
          </Tabs>

          <Box sx={{ px: 2 }}>
            {tab === 0 && (
              <Box>
                {bp.blueprint_description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {bp.blueprint_description}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Crafting time:</strong> {bp.crafting_time_seconds ? `${Math.floor(bp.crafting_time_seconds / 60)}m ${bp.crafting_time_seconds % 60}s` : "Unknown"}
                </Typography>
                <Typography variant="body2">
                  <strong>Ingredients:</strong> {data.ingredients?.length || 0}
                </Typography>
                {data.missions_rewarding && data.missions_rewarding.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Rewarded by missions:</Typography>
                    {data.missions_rewarding.map((m) => (
                      <Chip key={m.mission_id} label={m.mission_name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
              </Box>
            )}
            {tab === 1 && data.ingredients && (
              <Stack spacing={1}>
                {data.ingredients.map((ing, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Avatar
                      src={ing.game_item.icon_url}
                      variant="rounded"
                      sx={{ width: 28, height: 28, fontSize: "0.6rem", bgcolor: "secondary.main" }}
                      imgProps={{ style: { objectFit: "contain" } }}
                    >
                      {initials(ing.game_item.name)}
                    </Avatar>
                    <Typography variant="body2">{ing.game_item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                      ×{ing.quantity_required}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </>
      )}
    </StandardPageLayout>
  )
}
