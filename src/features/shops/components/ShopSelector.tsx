/**
 * ShopSelector — dropdown for selecting which shop to create a listing under.
 *
 * Fetches the user's shops via GET /shops/mine and offers the ones they can
 * list in (canEditShopListings: their own, and org shops where they have
 * Manage Market). If there are none, offers a quick-create button that
 * calls POST /shops/quick.
 */

import React, { useCallback, useEffect, useMemo } from "react"
import {
  Box,
  Button,
  CircularProgress,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { StorefrontRounded, AddBusinessRounded } from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { useGetMyShopsQuery } from "../../../store/api/v2/market"
import { canEditShopListings } from "../domain/shopPermissions"
import { useQuickCreateShop } from "../hooks/useShopActions"

interface ShopSelectorProps {
  value: string
  onChange: (shopId: string) => void
  label?: string
  helperText?: string
  id?: string
}

export function ShopSelector({
  value,
  onChange,
  label,
  helperText,
  id,
}: ShopSelectorProps) {
  const { t } = useTranslation()

  const { data: shops, isLoading, isError, refetch } = useGetMyShopsQuery()
  const { create: quickCreateShop, isLoading: isCreating } =
    useQuickCreateShop()

  // The user's shops they can list in (personal and org-owned)
  const filteredShops = useMemo(
    () =>
      (shops || []).filter(
        (s) => s.status !== "archived" && canEditShopListings(s),
      ),
    [shops],
  )

  // Auto-select if only one shop is available
  useEffect(() => {
    if (filteredShops.length === 1 && !value) {
      onChange(filteredShops[0].shop_id)
    }
  }, [filteredShops, value, onChange])

  const handleQuickCreate = useCallback(async () => {
    const shop = await quickCreateShop(true)
    if (shop) onChange(shop.shop_id)
  }, [quickCreateShop, onChange])

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          {t("ShopSelector.loading", "Loading shops...")}
        </Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
        <Typography variant="body2" color="error">
          {t("ShopSelector.error", "Failed to load shops.")}
        </Typography>
        <Button size="small" onClick={() => refetch()} color="secondary">
          {t("ShopSelector.retry", "Retry")}
        </Button>
      </Box>
    )
  }

  // No shops available — offer quick creation
  if (filteredShops.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t(
            "ShopSelector.noPersonalShops",
            "You don't have a personal shop yet. Create one to start selling.",
          )}
        </Typography>
        <LoadingButton
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<AddBusinessRounded />}
          loading={isCreating}
          onClick={handleQuickCreate}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("ShopSelector.quickCreate", "Create Shop")}
        </LoadingButton>
      </Box>
    )
  }

  return (
    <TextField
      select
      fullWidth
      size="small"
      id={id}
      label={label ?? t("ShopSelector.label", "Shop")}
      value={filteredShops.some((s) => s.shop_id === value) ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      color="secondary"
      helperText={
        helperText ??
        t(
          "ShopSelector.helperText",
          "Select which shop this listing belongs to",
        )
      }
      SelectProps={{
        renderValue: (selected) => {
          const shop = filteredShops.find((s) => s.shop_id === selected)
          if (!shop) return ""
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ImageAvatar
                alt=""
                src={shop.logo_url || undefined}
                sx={{ width: 20, height: 20 }}
              >
                <StorefrontRounded sx={{ fontSize: 14 }} />
              </ImageAvatar>
              <Typography variant="body2">{shop.name}</Typography>
            </Box>
          )
        },
      }}
    >
      {filteredShops.map((shop) => (
        <MenuItem key={shop.shop_id} value={shop.shop_id}>
          <ListItemAvatar sx={{ minWidth: 36 }}>
            <ImageAvatar
              alt=""
              src={shop.logo_url || undefined}
              sx={{ width: 24, height: 24 }}
            >
              <StorefrontRounded sx={{ fontSize: 16 }} />
            </ImageAvatar>
          </ListItemAvatar>
          <ListItemText
            primary={shop.name}
            secondary={shop.slug ? `/${shop.slug}` : undefined}
            primaryTypographyProps={{ variant: "body2" }}
            secondaryTypographyProps={{ variant: "caption" }}
          />
        </MenuItem>
      ))}
    </TextField>
  )
}
