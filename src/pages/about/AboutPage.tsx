import React from "react"
import { Alert, Box, Grid, Paper, Skeleton } from "@mui/material"
import { useTranslation } from "react-i18next"
import { HelpLayout, UpdatedStamp } from "../../features/help/components/HelpLayout"
import { Blocks } from "../../features/help/components/ContentBlocks"
import { helpIndex, useContentBody } from "../../features/help/content"
import { HELP_PATHS } from "../../routes/paths"
import { FRONTEND_URL } from "../../util/constants"
import { buildAboutHead } from "../../seo/contentHeads"

export function AboutPage() {
  const { t } = useTranslation()
  const about = helpIndex.about
  const { body, error } = useContentBody("about")

  return (
    <HelpLayout
      head={buildAboutHead(about, FRONTEND_URL)}
      path={HELP_PATHS.about}
      headerTitle={about.title}
    >
      <Grid item xs={12}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <UpdatedStamp updated={about.updated} author={about.author} />
          {body ? (
            <Blocks blocks={body.blocks} />
          ) : error ? (
            <Alert severity="error">{t("help.loadFailed", "This guide failed to load. Refresh the page to try again.")}</Alert>
          ) : (
            <Box aria-busy="true">
              <Skeleton height={28} />
              <Skeleton height={28} />
              <Skeleton height={28} width="60%" />
            </Box>
          )}
        </Paper>
      </Grid>
    </HelpLayout>
  )
}
