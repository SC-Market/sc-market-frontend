import React, { Suspense } from "react"
import { Box, Grid, Paper, Skeleton } from "@mui/material"
import { HelpLayout, UpdatedStamp } from "../../features/help/components/HelpLayout"
import { ContentBody } from "../../features/help/components/ContentBody"
import { helpIndex } from "../../features/help/content"
import { HELP_PATHS } from "../../routes/paths"
import { FRONTEND_URL } from "../../util/constants"
import { buildAboutHead } from "../../seo/contentHeads"

export function AboutPage() {
  const about = helpIndex.about

  return (
    <HelpLayout
      head={buildAboutHead(about, FRONTEND_URL)}
      path={HELP_PATHS.about}
      headerTitle={about.title}
    >
      <Grid item xs={12}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <UpdatedStamp updated={about.updated} author={about.author} />
          <Suspense
            fallback={
              <Box aria-busy="true">
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} width="60%" />
              </Box>
            }
          >
            <ContentBody contentKey="about" />
          </Suspense>
        </Paper>
      </Grid>
    </HelpLayout>
  )
}
