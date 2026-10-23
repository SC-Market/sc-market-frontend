import React from "react"
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Avatar,
} from "@mui/material"
import {
  InventoryRounded,
  RocketLaunchRounded,
  ScienceRounded,
  LocationOnRounded,
  BusinessRounded,
  SettingsRounded,
  AssignmentRounded,
  DescriptionRounded,
  CalculateRounded,
  TerrainRounded,
  ConstructionRounded,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../../routes/paths"
import { WIKI_HUB_SECTIONS, wikiHubSeoText } from "../../seo/hubHeads"

/** Card icons for WIKI_HUB_SECTIONS, by route. */
const SECTION_ICONS: Record<string, React.ReactElement> = {
  [WIKI_PATHS.items]: <InventoryRounded />,
  [WIKI_PATHS.ships]: <RocketLaunchRounded />,
  [WIKI_PATHS.commodities]: <ScienceRounded />,
  [WIKI_PATHS.locations]: <LocationOnRounded />,
  [WIKI_PATHS.manufacturers]: <BusinessRounded />,
  [WIKI_PATHS.refinery]: <SettingsRounded />,
  [GAME_DATA_PATHS.missions]: <AssignmentRounded />,
  [GAME_DATA_PATHS.blueprints]: <DescriptionRounded />,
  [GAME_DATA_PATHS.craftingCalculator]: <CalculateRounded />,
  [GAME_DATA_PATHS.resources]: <TerrainRounded />,
  [GAME_DATA_PATHS.mining]: <ConstructionRounded />,
}

export function WikiHub() {
  const { t } = useTranslation()
  const theme: ExtendedTheme = useTheme()

  const seo = wikiHubSeoText(t)

  return (
    <StandardPageLayout
      title={seo.title}
      description={seo.description}
      canonicalUrl={WIKI_PATHS.hub}
      headerTitle={seo.header}
      maxWidth="lg"
    >
      <Grid container spacing={2}>
        {WIKI_HUB_SECTIONS.map((section) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={section.route}>
            <Card
              sx={{
                height: "100%",
                background: theme.palette.background.paper,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={section.route}
                sx={{ height: "100%", p: 2 }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: theme.palette.primary.main + "22",
                      color: theme.palette.primary.main,
                      "& .MuiSvgIcon-root": { fontSize: 32 },
                    }}
                  >
                    {SECTION_ICONS[section.route]}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600} textAlign="center">
                    {t(section.labelKey, section.label)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </StandardPageLayout>
  )
}
