/**
 * ShopSelector — dropdown for selecting which shop to create a listing under.
 *
 * Fetches the user's shops via GET /shops/mine and filters based on the
 * current org context. If no shops exist, offers a quick-create button
 * that calls POST /shops/quick.
 */

import React, { useCallback, useEffect, useMemo } from "react"
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import { StorefrontRounded, AddBusinessRounded } from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import {
  useGetMyShopsQuery,
  useQuickCreateShopMutation,
  type ShopResponse,
} from "../../../../store/api/v2/market"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

interface ShopSelectorProps {
  value: string
  onChange: (shopId: string) => void
}

export function ShopSelector({ value, onChange }: ShopSelectorProps) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const issueAlert = useAlertHook()

  const { data: shops, isLoading, isError, refetch } = useGetMyShopsQuery()
  const [quickCreateShop, { isLoading: isCreating }] = useQuickCreateShopMutation()

  // Filter shops based on current org context
  const filteredShops = useMemo(() => {
    if (!shops) return []
    if (currentOrg) {
      // Show shops owned by any org (owner_contractor_id is set)
      // /shops/mine already filters to orgs the user is a member of
      return shops.filter((shop) => shop.owner_contractor_id)
    }
    // Show personal shops (no org owner)
    return shops.filter((shop) => shop.owner_user_id && !shop.owner_contractor_id)
  }, [shops, currentOrg])

  // Auto-select if only one shop is available
  useEffect(() => {
    if (filteredShops.length === 1 && !value) {
      onChange(filteredShops[0].shop_id)
    }
  }, [filteredShops, value, onChange])

  const handleQuickCreate = useCallback(async () => {
    try {
      const result = await quickCreateShop({
        quickCreateShopRequest: {
          owner_type: currentOrg ? "contractor" : "user",
          contractor_id: currentOrg?.spectrum_id,
        },
      }).unwrap()

      onChange(result.shop_id)
      issueAlert({
        message: t("ShopSelector.created", "Shop created: {{name}}", {
          name: result.name,
        }),
        severity: "success",
      })
    } catch (error) {
      const err = error as { data?: { message?: string } }
      issueAlert({
        message:
          err?.data?.message ||
          t("ShopSelector.createError", "Failed to create shop"),
        severity: "error",
      })
    }
  }, [quickCreateShop, currentOrg, onChange, issueAlert, t])

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
          {currentOrg
            ? t(
                "ShopSelector.noOrgShops",
                "No shop found for {{orgName}}. Create one to start selling.",
                { orgName: currentOrg.name }
              )
            : t(
                "ShopSelector.noPersonalShops",
                "You don't have a personal shop yet. Create one to start selling."
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
      label={t("ShopSelector.label", "Shop")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      color="secondary"
      helperText={t(
        "ShopSelector.helperText",
        "Select which shop this listing belongs to"
      )}
      SelectProps={{
        renderValue: (selected) => {
          const shop = filteredShops.find((s) => s.shop_id === selected)
          if (!shop) return ""
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={shop.logo_url || undefined}
                sx={{ width: 20, height: 20 }}
              >
                <StorefrontRounded sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="body2">{shop.name}</Typography>
            </Box>
          )
        },
      }}
    >
      {filteredShops.map((shop) => (
        <MenuItem key={shop.shop_id} value={shop.shop_id}>
          <ListItemAvatar sx={{ minWidth: 36 }}>
            <Avatar
              src={shop.logo_url || undefined}
              sx={{ width: 24, height: 24 }}
            >
              <StorefrontRounded sx={{ fontSize: 16 }} />
            </Avatar>
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
