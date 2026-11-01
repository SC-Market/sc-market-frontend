import React from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tabs,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { HapticTab } from "../../../components/haptic"
import type { NotificationScope } from "../domain/types"

interface ShopOption {
  shop_id: string
  name: string
}

/**
 * All / Personal / Shop tabs, plus a shop picker under "Shop" when the user
 * has shops. Shared by the /notifications page and the bell popover.
 */
export function NotificationScopeFilter({
  scope,
  shopId,
  shops,
  onScopeChange,
  onShopChange,
  idPrefix,
}: {
  scope: NotificationScope
  shopId: string
  shops: ShopOption[]
  onScopeChange: (scope: NotificationScope) => void
  onShopChange: (shopId: string) => void
  /** Keeps the shop picker's label id unique when two filters are mounted. */
  idPrefix: string
}) {
  const { t } = useTranslation()
  const labelId = `${idPrefix}-shop-filter-label`

  const tabs: { value: NotificationScope; label: string }[] = [
    { value: "all", label: t("notifications.scope.all", "All") },
    { value: "personal", label: t("notifications.scope.personal", "Personal") },
    { value: "shop", label: t("notifications.scope.shop", "Shop") },
  ]

  return (
    <Box>
      <Tabs
        value={scope}
        onChange={(_, value: NotificationScope) => onScopeChange(value)}
        variant="scrollable"
        scrollButtons={false}
        aria-label={t("notifications.scope.label", "Show notifications for")}
        sx={{ minHeight: 44 }}
      >
        {tabs.map((tab) => (
          <HapticTab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            sx={{ minHeight: 44 }}
          />
        ))}
      </Tabs>
      {scope === "shop" && shops.length > 0 && (
        <FormControl fullWidth size="small" sx={{ mt: 1.5, mb: 1 }}>
          <InputLabel id={labelId} shrink>
            {t("notifications.filter_by_shop", "Filter by shop")}
          </InputLabel>
          <Select
            labelId={labelId}
            value={shopId}
            label={t("notifications.filter_by_shop", "Filter by shop")}
            onChange={(e) => onShopChange(e.target.value)}
            displayEmpty
            notched
            renderValue={(value) =>
              value
                ? (shops.find((s) => s.shop_id === value)?.name ?? value)
                : t("notifications.all_shops", "All shops")
            }
          >
            <MenuItem value="">
              {t("notifications.all_shops", "All shops")}
            </MenuItem>
            {shops.map((shop) => (
              <MenuItem key={shop.shop_id} value={shop.shop_id}>
                {shop.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  )
}
