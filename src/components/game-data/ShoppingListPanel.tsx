/**
 * ShoppingListPanel — shows aggregated ingredient breakdown for a shopping list.
 * Each material shows: name, needed qty, have qty (editable), remaining, market link.
 * Used in the cart sidebar and as a standalone view.
 */

import React, { useState } from "react"
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import {
  CheckCircleRounded,
  ShoppingCartRounded,
  OpenInNewRounded,
  ExpandMoreRounded,
  ExpandLessRounded,
  DeleteRounded,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useGetWishlistsQuery,
  useGetWishlistQuery,
  useGenerateShoppingListQuery,
  type ShoppingListMaterial,
  type WishlistItemWithDetails,
} from "../../features/wishlists/api/wishlistsApi"
import { GameItemAvatar } from "../game-data/GameItemAvatar"
import { useWishlistItemActions } from "../../features/wishlists/hooks/useWishlistActions"
import { MARKET_PATHS } from "../../routes/paths"

/** Format SCU quantity */
function fmtQty(scu: number): string {
  if (scu >= 1) return `${scu.toFixed(1)} SCU`
  return `${scu.toFixed(2)} SCU`
}

// ============================================================================
// Main Panel
// ============================================================================

export function ShoppingListPanel() {
  const { t } = useTranslation()
  const {
    data: listsData,
    isLoading: listsLoading,
    error,
  } = useGetWishlistsQuery()
  const [selectedListId, setSelectedListId] = useState<string>("")

  const lists = listsData?.wishlists || []
  const activeId = selectedListId || lists[0]?.wishlist_id || ""

  if (listsLoading) return <CircularProgress size={24} />
  if (error) {
    const status = (error as { status?: number })?.status
    if (status === 401 || status === 403)
      return <Alert severity="info">{t("shoppingListUi.panel.signIn")}</Alert>
    return (
      <Alert severity="warning">{t("shoppingListUi.panel.listsError")}</Alert>
    )
  }
  if (!lists.length)
    return <Alert severity="info">{t("shoppingListUi.panel.noLists")}</Alert>

  return (
    <Stack spacing={1.5}>
      {lists.length > 1 && (
        <FormControl fullWidth size="small">
          <InputLabel id="shopping-list-panel-shopping-list-label">
            {t("wishlists.shoppingList")}
          </InputLabel>
          <Select
            labelId="shopping-list-panel-shopping-list-label"
            value={activeId}
            label={t("wishlists.shoppingList")}
            onChange={(e) => setSelectedListId(e.target.value)}
          >
            {lists.map((l) => (
              <MenuItem key={l.wishlist_id} value={l.wishlist_id}>
                {t("shoppingListUi.panel.listOption", {
                  name: l.wishlist_name,
                  count: l.item_count,
                })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {activeId && <ShoppingListDetail wishlistId={activeId} />}
    </Stack>
  )
}

// ============================================================================
// Detail View — items + materials
// ============================================================================

function ShoppingListDetail({ wishlistId }: { wishlistId: string }) {
  const { t } = useTranslation()
  const { data: detail } = useGetWishlistQuery(
    { wishlistId },
    { skip: !wishlistId },
  )
  const {
    data: shoppingList,
    isLoading,
    error,
  } = useGenerateShoppingListQuery({ wishlistId }, { skip: !wishlistId })
  const [expanded, setExpanded] = useState(true)

  if (isLoading) return <CircularProgress size={24} />
  if (error || !shoppingList)
    return <Alert severity="info">{t("shoppingListUi.panel.listError")}</Alert>

  const materials = shoppingList.materials_needed || []
  const items = detail?.items || []
  const fulfilledCount = materials.filter(
    (m) => m.quantity_to_acquire <= 0,
  ).length
  const totalCount = materials.length

  return (
    <Stack spacing={1}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">
          {detail?.wishlist.wishlist_name || t("wishlists.shoppingList")}
        </Typography>
        <Chip
          label={t("shoppingListUi.panel.materialsProgress", {
            fulfilled: fulfilledCount,
            count: totalCount,
          })}
          size="small"
          color={fulfilledCount === totalCount ? "success" : "default"}
          sx={{ height: 22, fontSize: "0.7rem" }}
        />
      </Stack>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={totalCount > 0 ? (fulfilledCount / totalCount) * 100 : 0}
        sx={{ height: 6, borderRadius: 3 }}
      />

      {/* Blueprint items (collapsible) */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="caption" fontWeight={600} sx={{ flex: 1 }}>
          {t("shoppingListUi.panel.blueprintsCount", { count: items.length })}
        </Typography>
        {expanded ? (
          <ExpandLessRounded sx={{ fontSize: 18 }} />
        ) : (
          <ExpandMoreRounded sx={{ fontSize: 18 }} />
        )}
      </Stack>
      {expanded && (
        <Stack spacing={0.5}>
          {items.map((item) => (
            <BlueprintItemRow
              key={item.item_id}
              item={item}
              wishlistId={wishlistId}
            />
          ))}
        </Stack>
      )}

      <Divider />

      {/* Materials breakdown */}
      <Typography variant="caption" fontWeight={600}>
        {t("shoppingListUi.panel.materialsNeeded")}
      </Typography>
      <Stack spacing={0.5}>
        {materials.map((mat) => (
          <MaterialRow key={mat.game_item_id} material={mat} />
        ))}
      </Stack>
    </Stack>
  )
}

// ============================================================================
// Blueprint Item Row — shows BP name, quantity selector, remove button
// ============================================================================

function BlueprintItemRow({
  item,
  wishlistId,
}: {
  item: WishlistItemWithDetails
  wishlistId: string
}) {
  const { t } = useTranslation()
  const { setQuantity, remove } = useWishlistItemActions(wishlistId)

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <GameItemAvatar
        name={item.game_item_name}
        iconUrl={item.game_item_icon}
        size={24}
      />
      <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: "0.8rem" }}>
        {item.blueprint_name || item.game_item_name}
      </Typography>
      <TextField
        size="small"
        type="number"
        value={item.desired_quantity}
        onChange={(e) => {
          const qty = Math.max(1, parseInt(e.target.value) || 1)
          setQuantity(item.item_id, qty)
        }}
        inputProps={{ min: 1, style: { textAlign: "center" } }}
        sx={{ width: 50, "& input": { py: 0.25, fontSize: "0.8rem" } }}
      />
      <IconButton
        size="small"
        onClick={() => remove(item.item_id)}
        aria-label={
          item.game_item_name
            ? t("shoppingListUi.panel.removeNamed", {
                name: item.game_item_name,
              })
            : t("shoppingListUi.panel.removeItem")
        }
      >
        <DeleteRounded sx={{ fontSize: 16 }} />
      </IconButton>
    </Stack>
  )
}

// ============================================================================
// Material Row — shows material, need/have/remaining, market link
// ============================================================================

function MaterialRow({ material: m }: { material: ShoppingListMaterial }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fulfilled = m.quantity_to_acquire <= 0
  const pct =
    m.total_quantity_needed > 0
      ? Math.min(
          100,
          (m.user_inventory_quantity / m.total_quantity_needed) * 100,
        )
      : 100

  const marketQuery = encodeURIComponent(m.game_item_name)

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        opacity: fulfilled ? 0.5 : 1,
        borderColor: fulfilled ? "success.main" : "divider",
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        <GameItemAvatar
          name={m.game_item_name}
          iconUrl={m.game_item_icon}
          size={20}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ fontSize: "0.8rem" }}
          >
            {m.game_item_name}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {fmtQty(m.user_inventory_quantity)} /{" "}
              {fmtQty(m.total_quantity_needed)}
            </Typography>
            {fulfilled && (
              <CheckCircleRounded
                sx={{ fontSize: 14, color: "success.main" }}
              />
            )}
          </Stack>
        </Box>
        {!fulfilled && (
          <Chip
            label={t("shoppingListUi.panel.need", {
              quantity: fmtQty(m.quantity_to_acquire),
            })}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.65rem" }}
          />
        )}
        <Tooltip
          title={t("shoppingListUi.panel.searchMarket", {
            name: m.game_item_name,
          })}
        >
          <IconButton
            size="small"
            onClick={() => navigate(`${MARKET_PATHS.search}?q=${marketQuery}`)}
          >
            <ShoppingCartRounded sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("shoppingListUi.panel.viewAggregate")}>
          <IconButton
            size="small"
            onClick={() => navigate(MARKET_PATHS.aggregate(m.game_item_id))}
          >
            <OpenInNewRounded sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>
      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={pct}
        color={fulfilled ? "success" : "primary"}
        sx={{ height: 3, borderRadius: 2, mt: 0.5 }}
      />
      {/* Used by */}
      {m.used_by_items.length > 1 && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 0.25, display: "block" }}
        >
          {t("shoppingListUi.panel.usedBy", {
            items: m.used_by_items.map((u) => u.item_name).join(", "),
          })}
        </Typography>
      )}
    </Paper>
  )
}
