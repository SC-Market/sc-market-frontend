import React from "react"
import { Chip, Stack } from "@mui/material"
import HardwareRoundedIcon from "@mui/icons-material/HardwareRounded"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartRounded"
import ConstructionIcon from "@mui/icons-material/ConstructionRounded"
import InventoryIcon from "@mui/icons-material/InventoryRounded"
import { useTranslation } from "react-i18next"

export function AcqChips({
  can_be_mined,
  can_be_purchased,
  can_be_salvaged,
  can_be_looted,
}: {
  can_be_mined: boolean
  can_be_purchased: boolean
  can_be_salvaged: boolean
  can_be_looted: boolean
}) {
  const { t } = useTranslation()
  const chips: {
    key: string
    label: string
    icon: React.ReactElement
    color: "success" | "primary" | "warning" | "error"
  }[] = []
  if (can_be_mined)
    chips.push({
      key: "mine",
      label: t("wiki.commodityBrowser.acqChip.mine", "Mine"),
      icon: <HardwareRoundedIcon />,
      color: "success",
    })
  if (can_be_purchased)
    chips.push({
      key: "buy",
      label: t("wiki.commodityBrowser.acqChip.buy", "Buy"),
      icon: <ShoppingCartIcon />,
      color: "primary",
    })
  if (can_be_salvaged)
    chips.push({
      key: "salvage",
      label: t("wiki.commodityBrowser.acqChip.salvage", "Salvage"),
      icon: <ConstructionIcon />,
      color: "warning",
    })
  if (can_be_looted)
    chips.push({
      key: "loot",
      label: t("wiki.commodityBrowser.acqChip.loot", "Loot"),
      icon: <InventoryIcon />,
      color: "error",
    })
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {chips.map((c) => (
        <Chip
          key={c.key}
          icon={c.icon}
          label={c.label}
          size="small"
          color={c.color}
          sx={{
            height: 18,
            fontSize: "0.6rem",
            fontWeight: 600,
            "& .MuiChip-icon": { fontSize: 11 },
          }}
        />
      ))}
    </Stack>
  )
}

export type AcqFilter = "all" | "mined" | "purchased" | "salvaged" | "looted"

export const ACQ_FILTERS: {
  value: AcqFilter
  label: string
  icon: React.ReactNode
}[] = [
  { value: "all", label: "All", icon: null },
  {
    value: "mined",
    label: "Minable",
    icon: <HardwareRoundedIcon sx={{ fontSize: 14 }} />,
  },
  {
    value: "purchased",
    label: "Purchasable",
    icon: <ShoppingCartIcon sx={{ fontSize: 14 }} />,
  },
  {
    value: "salvaged",
    label: "Salvageable",
    icon: <ConstructionIcon sx={{ fontSize: 14 }} />,
  },
  {
    value: "looted",
    label: "Lootable",
    icon: <InventoryIcon sx={{ fontSize: 14 }} />,
  },
]

export const ACQ_FILTER_KEYS: Record<AcqFilter, string> = {
  all: "wiki.commodityBrowser.acqFilter.all",
  mined: "wiki.commodityBrowser.acqFilter.mined",
  purchased: "wiki.commodityBrowser.acqFilter.purchased",
  salvaged: "wiki.commodityBrowser.acqFilter.salvaged",
  looted: "wiki.commodityBrowser.acqFilter.looted",
}
