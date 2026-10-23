import React from "react"
import { useParams } from "react-router-dom"
import { Grid } from "@mui/material"
import { useGetOreDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { OreDetailContent } from "./OreDetailContent"
import { FRONTEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { AnswerLead, AnswerFaqs } from "../../components/game-data/AnswerSummary"
import { buildOreAnswers } from "../../util/answerContent"
import { buildOreHead, miningDisplayName, oreSeoText } from "../../seo/gameDataHeads"
import { SeoHead } from "../../seo/SeoHead"

export function MiningOreDetailPage() {
  const { t, i18n } = useTranslation()
  const { name } = useParams<{ name: string }>()
  const { data: ore, isLoading, error } = useGetOreDetailQuery({ name: name! }, { skip: !name })
  const displayName = miningDisplayName(ore?.displayName, name)
  const head = ore && name ? buildOreHead(ore, name, FRONTEND_URL) : null

  const { title: seoTitle, description: seoDescription } = oreSeoText(displayName)
  const answers = ore ? buildOreAnswers(ore, t, i18n.language) : null

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/mining/ores/${name}`}
      headerTitle={displayName}
      breadcrumbs={[{ label: "Mining", href: "/mining" }, { label: "Ores", href: "/mining" }, { label: displayName }]}
      isLoading={isLoading} skeleton={<DetailPageSkeleton />} error={error || undefined}
      sidebarOpen={true} maxWidth="lg"
    >
      {ore && (
        <Grid item xs={12}>
          {head && <SeoHead head={head} />}
          {answers && <AnswerLead summary={answers.summary} />}
          <OreDetailContent ore={ore} />
          {answers && <AnswerFaqs faqs={answers.faqs} />}
        </Grid>
      )}
    </StandardPageLayout>
  )
}
