import React from "react"
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { Add, Delete } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

export interface BulkDiscountTier {
  min_quantity: number
  discount_percent: number
}

interface BulkDiscountTierEditorProps {
  tiers: BulkDiscountTier[]
  onChange: (tiers: BulkDiscountTier[]) => void
}

export function BulkDiscountTierEditor({
  tiers,
  onChange,
}: BulkDiscountTierEditorProps) {
  const { t } = useTranslation()

  const addTier = () => {
    const lastQty = tiers.length ? tiers[tiers.length - 1].min_quantity : 0
    onChange([...tiers, { min_quantity: lastQty + 10, discount_percent: 5 }])
  }

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index))
  }

  const updateTier = (index: number, field: keyof BulkDiscountTier, value: number) => {
    const updated = tiers.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : tier,
    )
    onChange(updated)
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t(
          "market.bulkDiscountDescription",
          "Offer discounts when buyers purchase larger quantities.",
        )}
      </Typography>
      <Stack spacing={1}>
        {tiers.map((tier, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <TextField
              label={t("market.minQuantity", "Min Qty")}
              type="number"
              size="small"
              value={tier.min_quantity}
              onChange={(e) =>
                updateTier(index, "min_quantity", Math.max(1, +e.target.value))
              }
              inputProps={{ min: 1 }}
              sx={{ width: 100 }}
            />
            <TextField
              label={t("market.discountPercent", "Discount %")}
              type="number"
              size="small"
              value={tier.discount_percent}
              onChange={(e) =>
                updateTier(
                  index,
                  "discount_percent",
                  Math.min(100, Math.max(0, +e.target.value)),
                )
              }
              inputProps={{ min: 0, max: 100 }}
              sx={{ width: 110 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {t("market.bulkDiscountSummary", "Buy {{qty}}+ get {{pct}}% off", {
                qty: tier.min_quantity,
                pct: tier.discount_percent,
              })}
            </Typography>
            <IconButton size="small" onClick={() => removeTier(index)}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button
        size="small"
        startIcon={<Add />}
        onClick={addTier}
        sx={{ mt: 1 }}
      >
        {t("market.addDiscountTier", "Add Tier")}
      </Button>
    </Box>
  )
}
