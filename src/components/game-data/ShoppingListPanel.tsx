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
import {
  useGetWishlistsQuery,
  useGetWishlistQuery,
  useGetShoppingListQuery,
  useUpdateWishlistItemMutation,
  useRemoveWishlistItemMutation,
  type ShoppingListMaterial,
  type WishlistItemWithDetails,
} from "../../store/wishlistsApi"
import { GameItemAvatar } from "../game-data/GameItemAvatar"

/** Format SCU quantity */
function fmtQty(scu: number): string {
  if (scu >= 1) return `${scu.toFixed(1)} SCU`
  return `${scu.toFixed(2)} SCU`
}

// ============================================================================
// Main Panel
// ============================================================================

export function ShoppingListPanel() {
  const { data: listsData, isLoading: listsLoading } = useGetWishlistsQuery()
  const [selectedListId, setSelectedListId] = useState<string>("")

  // Auto-select first list
  const lists = listsData?.wishlists || []
  const activeId = selectedListId || lists[0]?.wishlist_id || ""

  if (listsLoading) return <CircularProgress size={24} />
  if (!lists.length) return <Alert severity="info">No shopping lists. Add blueprints from the Fabricator.</Alert>

  return (
    <Stack spacing={1.5}>
      {lists.length > 1 && (
        <FormControl fullWidth size="small">
          <InputLabel>Shopping List</InputLabel>
          <Select value={activeId} label="Shopping List" onChange={(e) => setSelectedListId(e.target.value)}>
            {lists.map((l) => (
              <MenuItem key={l.wishlist_id} value={l.wishlist_id}>
                {l.wishlist_name} ({l.item_count} items)
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
  const { data: detail } = useGetWishlistQuery({ wishlist_id: wishlistId })
  const { data: shoppingList, isLoading } = useGetShoppingListQuery(wishlistId)
  const [expanded, setExpanded] = useState(true)

  if (isLoading) return <CircularProgress size={24} />
  if (!shoppingList) return null

  const materials = shoppingList.materials_needed || []
  const items = detail?.items || []
  const fulfilledCount = materials.filter((m) => m.quantity_to_acquire <= 0).length
  const totalCount = materials.length

  return (
    <Stack spacing={1}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">
          {detail?.wishlist.wishlist_name || "Shopping List"}
        </Typography>
        <Chip
          label={`${fulfilledCount}/${totalCount} materials`}
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
      <Stack direction="row" alignItems="center" sx={{ cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <Typography variant="caption" fontWeight={600} sx={{ flex: 1 }}>
          Blueprints ({items.length})
        </Typography>
        {expanded ? <ExpandLessRounded sx={{ fontSize: 18 }} /> : <ExpandMoreRounded sx={{ fontSize: 18 }} />}
      </Stack>
      {expanded && (
        <Stack spacing={0.5}>
          {items.map((item) => (
            <BlueprintItemRow key={item.item_id} item={item} wishlistId={wishlistId} />
          ))}
        </Stack>
      )}

      <Divider />

      {/* Materials breakdown */}
      <Typography variant="caption" fontWeight={600}>
        Materials Needed
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

function BlueprintItemRow({ item, wishlistId }: { item: WishlistItemWithDetails; wishlistId: string }) {
  const [updateItem] = useUpdateWishlistItemMutation()
  const [removeItem] = useRemoveWishlistItemMutation()

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <GameItemAvatar name={item.game_item_name} iconUrl={item.game_item_icon} size={24} />
      <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: "0.8rem" }}>
        {item.blueprint_name || item.game_item_name}
      </Typography>
      <TextField
        size="small"
        type="number"
        value={item.desired_quantity}
        onChange={(e) => {
          const qty = Math.max(1, parseInt(e.target.value) || 1)
          updateItem({ wishlist_id: wishlistId, item_id: item.item_id, body: { desired_quantity: qty } })
        }}
        inputProps={{ min: 1, style: { textAlign: "center" } }}
        sx={{ width: 50, "& input": { py: 0.25, fontSize: "0.8rem" } }}
      />
      <IconButton size="small" onClick={() => removeItem({ wishlist_id: wishlistId, item_id: item.item_id })}>
        <DeleteRounded sx={{ fontSize: 16 }} />
      </IconButton>
    </Stack>
  )
}

// ============================================================================
// Material Row — shows material, need/have/remaining, market link
// ============================================================================

function MaterialRow({ material: m }: { material: ShoppingListMaterial }) {
  const navigate = useNavigate()
  const fulfilled = m.quantity_to_acquire <= 0
  const pct = m.total_quantity_needed > 0
    ? Math.min(100, (m.user_inventory_quantity / m.total_quantity_needed) * 100)
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
        <GameItemAvatar name={m.game_item_name} iconUrl={m.game_item_icon} size={20} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: "0.8rem" }}>
            {m.game_item_name}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {fmtQty(m.user_inventory_quantity)} / {fmtQty(m.total_quantity_needed)}
            </Typography>
            {fulfilled && <CheckCircleRounded sx={{ fontSize: 14, color: "success.main" }} />}
          </Stack>
        </Box>
        {!fulfilled && (
          <Chip
            label={`Need ${fmtQty(m.quantity_to_acquire)}`}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.65rem" }}
          />
        )}
        <Tooltip title={`Search market for ${m.game_item_name}`}>
          <IconButton
            size="small"
            onClick={() => navigate(`/market?q=${marketQuery}`)}
          >
            <ShoppingCartRounded sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="View aggregate listings">
          <IconButton
            size="small"
            onClick={() => navigate(`/market/aggregate/${m.game_item_id}`)}
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
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: "block" }}>
          Used by: {m.used_by_items.map((u) => u.item_name).join(", ")}
        </Typography>
      )}
    </Paper>
  )
}
