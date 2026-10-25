import React from "react"
import { Card, CardActionArea, Grid, Typography } from "@mui/material"
import { Link as RouterLink, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HelpLayout } from "../../features/help/components/HelpLayout"
import { findCategory, guidesIn } from "../../features/help/content"
import { HELP_PATHS } from "../../routes/paths"
import { FRONTEND_URL } from "../../util/constants"
import { buildGuideCategoryHead, HELP_HUB_NAME } from "../../seo/contentHeads"
import { PageBody404 } from "../errors/Error404"

export function GuideCategory() {
  const { t } = useTranslation()
  const { category: categoryId } = useParams<{ category: string }>()
  const category = findCategory(categoryId)
  const helpCrumb = { label: t("help.hubTitle", HELP_HUB_NAME), href: HELP_PATHS.hub }

  if (!category) {
    return (
      <HelpLayout head={null} path={HELP_PATHS.category(categoryId ?? "")} headerTitle={null} breadcrumbs={[helpCrumb]}>
        <PageBody404 />
      </HelpLayout>
    )
  }

  const guides = guidesIn(category.id)
  return (
    <HelpLayout
      head={buildGuideCategoryHead(category, guides, FRONTEND_URL)}
      path={HELP_PATHS.category(category.id)}
      headerTitle={category.title}
      breadcrumbs={[helpCrumb, { label: category.title }]}
    >
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary">
          {category.description}
        </Typography>
      </Grid>
      {guides.map((guide) => (
        <Grid item xs={12} key={guide.id}>
          <Card>
            <CardActionArea component={RouterLink} to={HELP_PATHS.guide(guide.category, guide.slug)} sx={{ p: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                {guide.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {guide.description}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </HelpLayout>
  )
}
