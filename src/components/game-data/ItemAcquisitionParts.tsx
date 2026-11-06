// Shared bits of the "How to get" section (ItemAcquisitionSection).
import React from "react"
import { Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { formatAmount } from "../../seo/itemAcquisition"

export function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="subtitle1"
      component="h3"
      fontWeight={700}
      gutterBottom
    >
      {children}
    </Typography>
  )
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.primary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600} color="text.secondary">
        {value}
      </Typography>
    </Box>
  )
}

/** Formats an amount as "<n> aUEC" in the page's language. */
export function useAUEC() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  return (value: number) =>
    t("itemAcquisition.priceUnit", {
      defaultValue: "{{price}} aUEC",
      price: formatAmount(value, locale),
    })
}
