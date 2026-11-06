import React from "react"
import {
  Box,
  Typography,
  Stack,
  Divider,
  TextField,
  Avatar,
} from "@mui/material"
import { TimerRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { type BlueprintIngredient } from "../../features/game-data/api/gameDataApi"
import { GameItemAvatar } from "./GameItemAvatar"
import { formatCraftingTime } from "../../constants/crafting"
import { USER_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"

import type {
  BlueprintDetailResponse,
  GetOrgBlueprintOwnersApiResponse,
} from "../../features/game-data/api/gameDataApi"

/** Members of the user's org who own this blueprint. */
export function BlueprintOrgOwnersTab({
  orgOwners,
  onClose,
}: {
  orgOwners: GetOrgBlueprintOwnersApiResponse | undefined
  onClose: () => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const navigate = useNavigate()
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("blueprintsUi.detail.orgOwnersTitle")}
      </Typography>
      {orgOwners?.members.length ? (
        <Stack spacing={0.75}>
          {orgOwners.members.map((m) => (
            <Stack
              key={m.user_id}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                onClose()
                navigate(USER_PATHS.profile(m.username))
              }}
            >
              <Avatar
                src={m.avatar}
                sx={{ width: 32, height: 32, fontSize: "0.65rem" }}
              >
                {m.display_name.slice(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600} color="primary">
                  {m.display_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{m.username}
                  {m.acquisition_date && ` · ${fmt.date(m.acquisition_date)}`}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t("blueprintsUi.detail.noOrgOwners")}
        </Typography>
      )}
    </Box>
  )
}

/** Disassemble tab: materials recovered from a quantity of the crafted item. */
export function BlueprintDisassembleTab({
  bp,
  ingredients,
  craftQty,
  setCraftQty,
}: {
  bp: BlueprintDetailResponse["blueprint"] | undefined
  ingredients: BlueprintIngredient[]
  craftQty: number
  setCraftQty: (qty: number) => void
}) {
  const { t } = useTranslation()
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("blueprintsUi.detail.efficiency")}
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            50%
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("blueprintsUi.detail.timePerItem")}
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            <TimerRounded
              sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
            />
            {t("blueprintsUi.detail.secondsShort", { seconds: 15 })}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("blueprintsUi.detail.quantity")}
          </Typography>
          <TextField
            size="small"
            type="number"
            value={craftQty}
            sx={{ width: 60, "& input": { py: 0.5, fontSize: "0.8rem" } }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCraftQty(Math.max(1, +e.target.value || 1))
            }
            inputProps={{ min: 1 }}
          />
        </Box>
        {craftQty > 1 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t("blueprintsUi.detail.totalTime")}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatCraftingTime((bp?.crafting_time_seconds || 0) * craftQty)}
            </Typography>
          </Box>
        )}
      </Stack>
      <Divider />
      <Typography variant="subtitle2">
        {craftQty > 1
          ? t("blueprintsUi.detail.recoveredMaterialsTimes", {
              qty: craftQty,
            })
          : t("blueprintsUi.detail.recoveredMaterials")}
      </Typography>
      <Stack spacing={0.75}>
        {ingredients.map((ing: BlueprintIngredient, i: number) => {
          const recovered =
            parseFloat(String(ing.quantity_required)) * 0.5 * craftQty
          return (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <GameItemAvatar
                name={ing.game_item?.name}
                iconUrl={ing.game_item?.icon_url}
                subType={ing.game_item?.sub_type}
                itemType={ing.game_item?.type}
                size={28}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {ing.game_item?.name || t("blueprintsUi.detail.unknown")}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {recovered.toFixed(2)} SCU
              </Typography>
            </Stack>
          )
        })}
      </Stack>
    </Stack>
  )
}
