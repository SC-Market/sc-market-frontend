import React from "react"
import { useTranslation } from "react-i18next"
import { Box, Chip, Container, Grid, Paper, useTheme } from "@mui/material"
import { TabPanel } from "../../../components/tabs/Tabs"
import { Section } from "../../../components/paper/Section"
import { CreateOrderForm } from "../../../views/orders/CreateOrderForm"
import { OrgReviews } from "../../../views/contractor/OrgReviews"
import { MemberList } from "../../../views/contractor/OrgMembers"
import { RecruitingPostArea } from "../../recruiting/components/RecruitingPostArea"
import { OrgStoreView } from "../../profile/components/ProfileStoreView"
import { OrgServicesView } from "../../profile/components/ProfileServicesView"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { Contractor } from "../../../datatypes/Contractor"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

interface OrgTabContentProps {
  currentTab: number
  contractor: Contractor
}

export function OrgTabContent({ currentTab, contractor }: OrgTabContentProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <TabPanel value={currentTab} index={0}>
        <OrgStoreView org={contractor.spectrum_id} />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <OrgServicesView org={contractor.spectrum_id} />
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
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
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <CreateOrderForm contractor_id={contractor.spectrum_id} />
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={4}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <MemberList contractor={contractor} />
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={5}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <RecruitingPostArea spectrum_id={contractor.spectrum_id} />
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={6}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Section xs={12} lg={8} disablePadding>
            <OrgReviews contractor={contractor} />
          </Section>
        </Grid>
      </TabPanel>
    </Container>
  )
}
