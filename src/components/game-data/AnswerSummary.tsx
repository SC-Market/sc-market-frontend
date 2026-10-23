import React from "react"
import { Card, CardContent, Stack, Typography } from "@mui/material"
import { Helmet } from "@unhead/react/helmet"
import { useTranslation } from "react-i18next"
import type { AnswerFaq } from "../../util/answerContent"

/** Plain-language summary shown at the top of a game-data page. */
export function AnswerLead({ summary }: { summary: string }) {
  return (
    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
      {summary}
    </Typography>
  )
}

/**
 * Visible question/answer list with matching FAQPage structured data.
 * Renders nothing when there are no FAQs.
 */
export function AnswerFaqs({ faqs }: { faqs: AnswerFaq[] }) {
  const { t } = useTranslation()
  if (faqs.length === 0) return null

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          })}
        </script>
      </Helmet>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" component="h2" gutterBottom>
            {t("seoAnswers.faqTitle", "Common questions")}
          </Typography>
          <Stack spacing={1.5}>
            {faqs.map((faq) => (
              <div key={faq.question}>
                <Typography variant="body2" component="h3" fontWeight={600}>
                  {faq.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </div>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </>
  )
}
