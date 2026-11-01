/**
 * /changelog (newest first) and /changelog/<date> (one entry). Entries are
 * Markdown in /content/changelog; only `status: published` ones are built,
 * so everything here is published. Entry text is English, like the guides.
 */
import React, { Suspense } from "react"
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Grid,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { Link as RouterLink, useParams } from "react-router-dom"
import { Helmet } from "@unhead/react/helmet"
import { useTranslation } from "react-i18next"
import { HelpLayout } from "../../features/help/components/HelpLayout"
import { ContentBody } from "../../features/help/components/ContentBody"
import { changelogEntries, findChangelogEntry } from "../../features/help/content"
import { changelogBodyKey, type ChangelogMeta } from "../../features/help/domain/types"
import { CHANGELOG_PATHS } from "../../routes/paths"
import { FRONTEND_URL } from "../../util/constants"
import {
  buildChangelogEntryHead,
  buildChangelogIndexHead,
  CHANGELOG_NAME,
  changelogSeoText,
  formatChangelogDate,
} from "../../seo/contentHeads"
import { PageBody404 } from "../errors/Error404"

/** <link rel="alternate"> so feed readers find the Atom feed. */
function FeedDiscovery() {
  return (
    <Helmet
      link={[
        {
          rel: "alternate",
          type: "application/atom+xml",
          title: "SC Market changelog",
          href: `${FRONTEND_URL}${CHANGELOG_PATHS.feed}`,
        },
      ]}
    />
  )
}

function EntryStamp({ entry }: { entry: ChangelogMeta }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography variant="body2" color="text.primary">
        <time dateTime={entry.date}>{formatChangelogDate(entry.date)}</time>
      </Typography>
      {entry.tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" variant="outlined" />
      ))}
    </Stack>
  )
}

function FeedLink() {
  const { t } = useTranslation()
  return (
    <Link href={CHANGELOG_PATHS.feed} variant="body2" color="secondary">
      {t("changelog.feed", "Atom feed")}
    </Link>
  )
}

function ChangelogIndex() {
  const { t } = useTranslation()
  return (
    <HelpLayout
      head={buildChangelogIndexHead(changelogEntries, FRONTEND_URL)}
      path={CHANGELOG_PATHS.index}
      headerTitle={t("changelog.title", CHANGELOG_NAME)}
      directory={false}
    >
      <FeedDiscovery />
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary">
          {changelogSeoText.description}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <FeedLink />
        </Box>
      </Grid>
      {changelogEntries.length === 0 ? (
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }} data-testid="changelog-empty">
            <Typography variant="body1" color="text.secondary">
              {t("changelog.empty", "No updates have been published yet. Check back soon.")}
            </Typography>
          </Paper>
        </Grid>
      ) : (
        changelogEntries.map((entry) => (
          <Grid item xs={12} key={entry.slug}>
            <Card component="article" aria-labelledby={`changelog-${entry.slug}`}>
              <CardActionArea component={RouterLink} to={CHANGELOG_PATHS.entry(entry.slug)} sx={{ p: { xs: 2, sm: 3 } }}>
                <EntryStamp entry={entry} />
                <Typography
                  id={`changelog-${entry.slug}`}
                  variant="h6"
                  component="h2"
                  color="text.secondary"
                  sx={{ fontWeight: 700, mt: 1 }}
                >
                  {entry.title}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                  {entry.summary}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))
      )}
    </HelpLayout>
  )
}

function ChangelogEntryPage({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const entry = findChangelogEntry(slug)
  const crumb = { label: t("changelog.title", CHANGELOG_NAME), href: CHANGELOG_PATHS.index }

  if (!entry) {
    return (
      <HelpLayout head={null} path={CHANGELOG_PATHS.entry(slug)} headerTitle={null} breadcrumbs={[crumb]} directory={false}>
        <PageBody404 />
      </HelpLayout>
    )
  }

  return (
    <HelpLayout
      head={buildChangelogEntryHead(entry, FRONTEND_URL)}
      path={CHANGELOG_PATHS.entry(entry.slug)}
      headerTitle={entry.title}
      breadcrumbs={[crumb, { label: entry.title }]}
      directory={false}
    >
      <FeedDiscovery />
      <Grid item xs={12}>
        <Paper component="article" sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 2 }}>
            <EntryStamp entry={entry} />
          </Box>
          <Suspense
            fallback={
              <Box aria-busy="true">
                <Typography variant="body1">{entry.summary}</Typography>
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} width="60%" />
              </Box>
            }
          >
            <ContentBody contentKey={changelogBodyKey(entry.slug)} />
          </Suspense>
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={2}>
            <Link component={RouterLink} to={CHANGELOG_PATHS.index} variant="body2" color="secondary">
              {t("changelog.allUpdates", "All updates")}
            </Link>
            <FeedLink />
          </Stack>
        </Paper>
      </Grid>
    </HelpLayout>
  )
}

export function ChangelogPage() {
  const { slug } = useParams<{ slug?: string }>()
  return slug === undefined ? <ChangelogIndex /> : <ChangelogEntryPage slug={slug} />
}
