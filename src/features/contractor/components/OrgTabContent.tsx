import React from "react"
import { useTranslation } from "react-i18next"
import { Alert, Box, Chip, Container, Grid, Paper, useTheme } from "@mui/material"
import { Link } from "react-router-dom"
import { TabPanel } from "../../../components/tabs/Tabs"
import { Section } from "../../../components/paper/Section"
import { OrgReviews } from "../../../views/contractor/OrgReviews"
import { MemberList } from "../../../views/contractor/OrgMembers"
import { RecruitingPostArea } from "../../recruiting/components/RecruitingPostArea"
import { OrgStoreView } from "../../profile/components/ProfileStoreView"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { Contractor } from "../domain/types"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetShopsByOwnerQuery } from "../../../store/api/v2/market"

interface OrgTabContentProps {
  currentTab: number
  contractor: Contractor
}

export function OrgTabContent({ currentTab, contractor }: OrgTabContentProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <TabPanel value={currentTab} index={0} preload>
        <OrgStoreView org={contractor.spectrum_id} />
      </TabPanel>
      <TabPanel value={currentTab} index={1} preload>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent="center"
        >
          <Grid item xs={12}>
            <Paper
              sx={{
                padding: 2,
                paddingTop: 1,
                maxHeight: 400,
                overflow: "auto",
              }}
            >
              <MarkdownRender text={contractor.description} />
              {contractor.languages && contractor.languages.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 0.5,
                    flexWrap: "wrap",
                  }}
                >
                  {contractor.languages.map((lang) => (
                    <Chip
                      key={lang.code}
                      label={`${lang.name} (${t(`languages.${lang.code}`, lang.name)})`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={2} preload>
        <OrgShopRedirect spectrumId={contractor.spectrum_id} />
      </TabPanel>
      <TabPanel value={currentTab} index={3} preload>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <MemberList contractor={contractor} />
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={4} preload>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <RecruitingPostArea spectrum_id={contractor.spectrum_id} />
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={5} preload>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Section xs={12} lg={8} disablePadding>
            <OrgReviews contractor={contractor} />
          </Section>
        </Grid>
      </TabPanel>
    </Container>
  )
}

function OrgShopRedirect({ spectrumId }: { spectrumId: string }) {
  const { t } = useTranslation()
  const { data: shops } = useGetShopsByOwnerQuery({ spectrumId })
  const shop = shops?.[0]

  if (shop) {
    return (
      <Alert severity="info" action={
        <Link to={`/shops/${shop.slug}`} style={{ color: "inherit" }}>
          {t("common.viewShop", "View Shop")}
        </Link>
      }>
        {t("org.customOrdersMovedToShop", "Custom orders are now placed through shops.")}
      </Alert>
    )
  }

  return (
    <Alert severity="info">
      {t("org.customOrdersMovedToShop", "Custom orders are now placed through shops.")}
    </Alert>
  )
}
