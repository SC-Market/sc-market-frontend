import React from "react"
import { List, Paper, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { Helmet } from "@unhead/react/helmet"
import { FAQQuestion } from "./FAQQuestion"
import { faqPageJsonLd, serializeJsonLd } from "../../seo/pageHead"
import { landingFaqs } from "../../seo/siteHeads"

export function FAQSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // One source for the visible Q&A and the FAQPage JSON-LD (the edge
  // bridge renders the same landingFaqs).
  const faqs = landingFaqs(t)
  const faqSchema = faqPageJsonLd(faqs)

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{serializeJsonLd(faqSchema)}</script>
      </Helmet>
      <Stack
        direction={"row"}
        sx={{ flexWrap: "wrap" }}
        spacing={theme.layoutSpacing.compact}
      >
        <Typography
          variant={"h3"}
          color={"text.secondary"}
          sx={{
            maxWidth: "min(400px, 100%)",
            flexShrink: "0",
            marginBottom: 2,
          }}
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
            {faqs.map((faq, i) => (
              <FAQQuestion
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                first={i === 0}
                last={i === faqs.length - 1}
                keepMounted
              />
            ))}
          </List>
        </Paper>
      </Stack>
    </>
  )
}
