import React from "react"
import { List, Paper, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { FAQQuestion } from "./FAQQuestion"

export function FAQSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      sx={{ flexWrap: "wrap" }}
      spacing={theme.layoutSpacing.compact}
    >
      <Typography
        variant={"h3"}
        color={"text.secondary"}
        sx={{ maxWidth: "min(400px, 100%)", flexShrink: "0", marginBottom: 2 }}
      >
        {t("landing.faqTitle")}
      </Typography>
      <Paper sx={{ flexGrow: "1" }}>
        <List
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            padding: 0,
          }}
        >
          <FAQQuestion
            question={t("landing.faqSellItemsQ")}
            answer={t("landing.faqSellItemsA")}
            first
          />
          <FAQQuestion
            question={t("landing.faqSafeQ")}
            answer={t("landing.faqSafeA")}
          />
          <FAQQuestion
            question={t("landing.faqListThingsQ")}
            answer={t("landing.faqListThingsA")}
          />
          <FAQQuestion
            question={t("landing.faqFeeQ")}
            answer={t("landing.faqFeeA")}
          />
          <FAQQuestion
            question={t("landing.faqRealMoneyQ")}
            answer={t("landing.faqRealMoneyA")}
            last
          />
        </List>
      </Paper>
    </Stack>
  )
}
