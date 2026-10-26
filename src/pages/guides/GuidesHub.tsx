import React from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HelpLayout } from "../../features/help/components/HelpLayout"
import { guidesIn, helpIndex } from "../../features/help/content"
import { HELP_PATHS } from "../../routes/paths"
import { FRONTEND_URL } from "../../util/constants"
import { buildGuidesHubHead, HELP_HUB_NAME, helpHubSeoText } from "../../seo/contentHeads"

export function GuidesHub() {
  const { t } = useTranslation()
  const head = buildGuidesHubHead(helpIndex, FRONTEND_URL)
  const start = helpIndex.guides[0]

  return (
    <HelpLayout head={head} path={HELP_PATHS.hub} headerTitle={t("help.hubTitle", HELP_HUB_NAME)}>
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary">
          {helpHubSeoText.description}
        </Typography>
        {start && (
          <Typography variant="body1" sx={{ mt: 1 }}>
            {t("help.newHere", "New to SC Market?")}{" "}
            <Link component={RouterLink} to={HELP_PATHS.guide(start.category, start.slug)} color="secondary">
              {start.title}
            </Link>
          </Typography>
        )}
      </Grid>
      {/*
        Balanced columns, not a grid: categories hold different numbers of
        guides, and grid rows stretch every card to the tallest one in the
        row. CSS columns pack the cards by height and read top to bottom,
        left to right, so the user-journey order is kept. Two columns only
        when each gets 300px: the content area is narrow next to the app
        sidebar and the directory, whatever the viewport.
      */}
      <Grid item xs={12}>
        <Box data-testid="guides-hub-categories" sx={{ columns: "300px 2", columnGap: 2 }}>
          {helpIndex.categories.map((category) => {
            const guides = guidesIn(category.id)
            return (
              <Card
                key={category.id}
                component="section"
                aria-labelledby={`guides-hub-${category.id}`}
                sx={{ breakInside: "avoid", display: "inline-block", width: "100%", mb: 2 }}
              >
                <CardActionArea component={RouterLink} to={HELP_PATHS.category(category.id)} sx={{ p: 2, pb: 0 }}>
                  <Typography id={`guides-hub-${category.id}`} variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardActionArea>
                <CardContent sx={{ pt: 1, "&:last-child": { pb: 2 } }}>
                  <List dense disablePadding>
                    {guides.map((guide) => (
                      <ListItem key={guide.id} disableGutters>
                        <Link component={RouterLink} to={HELP_PATHS.guide(guide.category, guide.slug)} color="secondary">
                          {guide.title}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {t("help.aboutPrompt", "What is SC Market?")}
          </Typography>
          <Link component={RouterLink} to={HELP_PATHS.about} variant="body2" color="secondary">
            {t("help.aboutLink", "About SC Market")}
          </Link>
        </Stack>
      </Grid>
    </HelpLayout>
  )
}
