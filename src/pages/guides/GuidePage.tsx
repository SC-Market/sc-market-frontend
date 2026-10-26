import React from "react"
import { Alert, Box, Divider, Grid, Link, List, ListItem, Paper, Skeleton, Typography } from "@mui/material"
import { Link as RouterLink, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HelpLayout, UpdatedStamp } from "../../features/help/components/HelpLayout"
import { Blocks } from "../../features/help/components/ContentBlocks"
import {
  findCategory,
  findGuide,
  findGuideById,
  guidesIn,
  useContentBody,
} from "../../features/help/content"
import { HELP_PATHS } from "../../routes/paths"
import { FRONTEND_URL } from "../../util/constants"
import { buildGuideHead, HELP_HUB_NAME } from "../../seo/contentHeads"
import type { GuideMeta } from "../../features/help/domain/types"
import { PageBody404 } from "../errors/Error404"

function GuideLinks({ title, guides }: { title: string; guides: GuideMeta[] }) {
  if (guides.length === 0) return null
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <List dense disablePadding>
        {guides.map((guide) => (
          <ListItem key={guide.id} disableGutters>
            <Link component={RouterLink} to={HELP_PATHS.guide(guide.category, guide.slug)} color="secondary">
              {guide.title}
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export function GuidePage() {
  const { t } = useTranslation()
  const { category: categoryId, slug } = useParams<{ category: string; slug: string }>()
  const guide = findGuide(categoryId, slug)
  const category = findCategory(guide?.category)
  const { body, error } = useContentBody(guide?.id)
  const helpCrumb = { label: t("help.hubTitle", HELP_HUB_NAME), href: HELP_PATHS.hub }

  if (!guide || !category) {
    return (
      <HelpLayout
        head={null}
        path={HELP_PATHS.guide(categoryId ?? "", slug ?? "")}
        headerTitle={null}
        breadcrumbs={[helpCrumb]}
      >
        <PageBody404 />
      </HelpLayout>
    )
  }

  const related = guide.related.map(findGuideById).filter((g): g is GuideMeta => !!g)
  const relatedIds = new Set([guide.id, ...guide.related])
  const more = guidesIn(category.id).filter((g) => !relatedIds.has(g.id))

  return (
    <HelpLayout
      head={buildGuideHead(guide, category, body?.steps ?? [], FRONTEND_URL)}
      path={HELP_PATHS.guide(guide.category, guide.slug)}
      headerTitle={guide.title}
      loading={!body && !error}
      breadcrumbs={[
        helpCrumb,
        { label: category.title, href: HELP_PATHS.category(category.id) },
        { label: guide.title },
      ]}
    >
      <Grid item xs={12}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <UpdatedStamp updated={guide.updated} author={guide.author} />
          {body ? (
            <Blocks blocks={body.blocks} />
          ) : error ? (
            <Alert severity="error">{t("help.loadFailed", "This guide failed to load. Refresh the page to try again.")}</Alert>
          ) : (
            <Box aria-busy="true">
              <Typography variant="body1">{guide.description}</Typography>
              <Skeleton height={28} />
              <Skeleton height={28} />
              <Skeleton height={28} width="60%" />
            </Box>
          )}
          <Divider sx={{ mt: 3 }} />
          <GuideLinks title={t("help.nextSteps", "Next steps")} guides={related} />
          <GuideLinks title={t("help.moreIn", "More in {{category}}", { category: category.title })} guides={more} />
        </Paper>
      </Grid>
    </HelpLayout>
  )
}
