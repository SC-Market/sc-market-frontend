import React from "react"
import { List, Paper } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Helmet } from "@unhead/react/helmet"
import { FAQQuestion } from "./FAQQuestion"
import { LandingSection, LandingSectionHeader } from "./LandingSection"
import { faqPageJsonLd, serializeJsonLd } from "../../seo/pageHead"
import { landingFaqs } from "../../seo/siteHeads"

/** The homepage FAQ: an accordion on Paper, the first answer open. Static. */
export function FAQSection() {
  const { t } = useTranslation()

  // One source for the visible Q&A and the FAQPage JSON-LD (the edge
  // bridge renders the same landingFaqs).
  const faqs = landingFaqs(t)
  const faqSchema = faqPageJsonLd(faqs)

  return (
    <LandingSection labelledBy="landing-faq-title" testId="landing-faq">
      <Helmet>
        <script type="application/ld+json">{serializeJsonLd(faqSchema)}</script>
      </Helmet>
      <LandingSectionHeader id="landing-faq-title" title={t("landing.faqTitle")} />
      <Paper>
        {/* A div, not a <ul>: each FAQ entry is an <h3> + answer (the
            accordion pattern), which aren't valid <ul> children. */}
        <List component="div" sx={{ padding: 0 }}>
          {faqs.map((faq, i) => (
            <FAQQuestion
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              first={i === 0}
              last={i === faqs.length - 1}
              defaultOpen={i === 0}
              dense
              keepMounted
            />
          ))}
        </List>
      </Paper>
    </LandingSection>
  )
}
