/**
 * BlueprintDetailModal — renders the same content as BlueprintDetail page inside a dialog.
 */

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  Divider,
  TextField,
  ButtonGroup,
  Button,
  Tabs,
  Tab,
} from "@mui/material"
import {
  CloseRounded,
  BuildRounded,
  TimerRounded,
  BookmarkRounded,
  BookmarkBorderRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetBlueprintDetailQuery,
  useGetOrgBlueprintOwnersQuery,
} from "../../features/game-data/api/gameDataApi"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useBlueprintOwnership } from "../../features/game-data/hooks/useGameDataActions"
import { getItemCategoryColor } from "../../util/gameIcons"
import { GameItemAvatar } from "./GameItemAvatar"
import { BlueprintTags, blueprintTagsFromDetail } from "./BlueprintTags"

import { formatCraftingTime } from "../../constants/crafting"
import {
  isModifierPositive,
  formatModifierValue,
  buildPropertyDefMap,
  propertyDisplayName,
} from "../../util/statDisplay"
import { DetailPageSkeleton } from "./GameDataSkeletons"

import { useBlueprintModalQualities } from "./useBlueprintModalQualities"
import {
  BlueprintIngredientSliders,
  BlueprintMissionChips,
  BlueprintProductStats,
} from "./BlueprintModalCraftParts"
import {
  BlueprintDisassembleTab,
  BlueprintOrgOwnersTab,
} from "./BlueprintModalTabs"

interface Props {
  blueprintId: string | null
  open: boolean
  onClose: () => void
}

export function BlueprintDetailModal({ blueprintId, open, onClose }: Props) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: blueprintId! },
    { skip: !blueprintId },
  )
  const bp = data?.blueprint
  const outputItem = data?.output_item
  const itemName =
    outputItem?.name || bp?.blueprint_name || t("crafting.blueprint")
  const ingredients = useMemo(
    () => data?.ingredients || [],
    [data?.ingredients],
  )
  const slotModifiers = useMemo(
    () => data?.slot_modifiers || [],
    [data?.slot_modifiers],
  )
  const itemAttrs = data?.item_attributes || {}
  const craftedPropertyDefs = data?.crafted_property_defs

  const { data: userProfile } = useGetUserProfileQuery()
  const spectrumId = userProfile?.contractors?.[0]?.spectrum_id
  const [tab, setTab] = useState(0)
  const [missionsExpanded, setMissionsExpanded] = useState(false)

  const toggleOwned = useBlueprintOwnership(blueprintId)
  const userOwns = data?.user_owns ?? false

  const handleToggleOwned = () => toggleOwned(userOwns)

  const { data: orgOwners } = useGetOrgBlueprintOwnersQuery(
    { blueprintId: blueprintId!, spectrumId: spectrumId! },
    { skip: !blueprintId || !spectrumId },
  )

  React.useEffect(() => {
    setTab(0)
  }, [blueprintId])

  const {
    modsBySlot,
    qualities,
    qualityRanges,
    setQuality,
    setAllQualities,
    combinedModifiers,
    outputQuality,
  } = useBlueprintModalQualities(ingredients, slotModifiers)

  const propDefMap = useMemo(
    () => buildPropertyDefMap(craftedPropertyDefs),
    [craftedPropertyDefs],
  )

  const [craftQty, setCraftQty] = useState(1)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <GameItemAvatar
            name={itemName}
            iconUrl={outputItem?.icon_url || bp?.icon_url}
            size={36}
            useCommodityColor={false}
            sx={{ bgcolor: getItemCategoryColor(bp?.item_category) }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="span"
              variant="inherit"
              display="block"
              noWrap
            >
              {itemName}
            </Typography>
            {data && (
              <BlueprintTags
                blueprint={blueprintTagsFromDetail(data)}
                size="small"
                onNavigate={onClose}
              />
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            size="small"
            onClick={handleToggleOwned}
            color={userOwns ? "primary" : "default"}
            aria-label={
              userOwns
                ? t("blueprintsUi.removeFromInventory")
                : t("blueprintsUi.detail.markAsOwned")
            }
            title={
              userOwns
                ? t("blueprintsUi.removeFromInventory")
                : t("blueprintsUi.detail.markAsOwned")
            }
          >
            {userOwns ? (
              <BookmarkRounded fontSize="small" />
            ) : (
              <BookmarkBorderRounded fontSize="small" />
            )}
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label={t("common.close", "Close")}
          >
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
        <Tab label={t("blueprintsUi.detail.craft")} />
        <Tab label={t("blueprintsUi.detail.disassemble")} />
        {spectrumId && <Tab label={t("blueprintsUi.detail.orgOwners")} />}
      </Tabs>

      <DialogContent sx={{ minHeight: 300 }}>
        {isLoading && <DetailPageSkeleton />}
        {error && (
          <Alert severity="error">{t("blueprintsUi.detail.loadError")}</Alert>
        )}

        {data && tab === 0 && (
          <Stack spacing={2}>
            {/* Product Stats */}
            <BlueprintProductStats
              itemAttrs={itemAttrs}
              combinedModifiers={combinedModifiers}
              propDefMap={propDefMap}
            />

            {/* Missions */}
            {data.missions_rewarding?.length > 0 && (
              <BlueprintMissionChips
                missions={data.missions_rewarding}
                expanded={missionsExpanded}
                setExpanded={setMissionsExpanded}
                onClose={onClose}
              />
            )}

            <Divider />

            {/* Craft quantity + Quality Presets on same row */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("blueprintsUi.detail.quantity")}
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={craftQty}
                  sx={{
                    width: 60,
                    display: "block",
                    "& input": { py: 0.5, fontSize: "0.8rem" },
                  }}
                  onChange={(e) =>
                    setCraftQty(Math.max(1, +e.target.value || 1))
                  }
                  inputProps={{ min: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("blueprintsUi.detail.qualityPresets")}
                </Typography>
                <ButtonGroup
                  size="small"
                  variant="outlined"
                  sx={{ display: "block" }}
                >
                  <Button onClick={() => setAllQualities("min")}>
                    {t("blueprintsUi.detail.presetMin")}
                  </Button>
                  <Button onClick={() => setAllQualities("mid")}>
                    {t("blueprintsUi.detail.presetBase")}
                  </Button>
                  <Button onClick={() => setAllQualities("max")}>
                    {t("blueprintsUi.detail.presetMax")}
                  </Button>
                </ButtonGroup>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Chip
                label={t("blueprintsUi.detail.outputQuality", {
                  quality: outputQuality,
                })}
                color={
                  outputQuality >= 800
                    ? "success"
                    : outputQuality >= 400
                      ? "primary"
                      : "default"
                }
                size="small"
              />
            </Stack>

            {/* Ingredients */}
            <Typography variant="subtitle2">
              <BuildRounded sx={{ fontSize: 16, mr: 0.5 }} />
              {t("blueprintsUi.detail.craft")}
            </Typography>

            {/* Scaling attributes summary */}
            {combinedModifiers.size > 0 && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 0.5 }}
              >
                {Array.from(combinedModifiers.entries()).map(
                  ([prop, { value: modifier, modifierType }]) => {
                    const def = propDefMap.get(prop)
                    const formatted = formatModifierValue(
                      modifier,
                      modifierType,
                      def,
                    )
                    const neutralValue = modifierType === "additive" ? 0 : 1
                    // For isModifierPositive, normalize additive to a multiplicative-like value
                    const positiveCheck =
                      modifierType === "additive" ? 1 + modifier : modifier
                    return (
                      <Chip
                        key={prop}
                        size="small"
                        label={`${propertyDisplayName(prop, def, t)}: ${formatted}`}
                        color={
                          isModifierPositive(prop, positiveCheck)
                            ? "success"
                            : modifier === neutralValue
                              ? "default"
                              : "error"
                        }
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                    )
                  },
                )}
              </Stack>
            )}
            <BlueprintIngredientSliders
              ingredients={ingredients}
              qualities={qualities}
              qualityRanges={qualityRanges}
              setQuality={setQuality}
              modsBySlot={modsBySlot}
              propDefMap={propDefMap}
              craftQty={craftQty}
            />

            {bp?.crafting_time_seconds && (
              <Typography variant="body2" color="text.secondary">
                <TimerRounded
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
                />
                {t("blueprintsUi.detail.craftTime", {
                  time: formatCraftingTime(bp.crafting_time_seconds * craftQty),
                })}
                {craftQty > 1 &&
                  ` ${t("blueprintsUi.detail.craftTimeEach", { time: formatCraftingTime(bp.crafting_time_seconds) })}`}
              </Typography>
            )}
          </Stack>
        )}

        {/* Disassemble tab */}
        {data && tab === 1 && (
          <BlueprintDisassembleTab
            bp={bp}
            ingredients={ingredients}
            craftQty={craftQty}
            setCraftQty={setCraftQty}
          />
        )}

        {/* Org Owners tab */}
        {tab === 2 && spectrumId && (
          <BlueprintOrgOwnersTab orgOwners={orgOwners} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
