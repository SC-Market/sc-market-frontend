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

interface WikiSection {
  label: string
  labelKey: string
  route: string
  icon: React.ReactElement
}

const WIKI_SECTIONS: WikiSection[] = [
  { label: "Items", labelKey: "wiki.hub.sectionItems", route: "/wiki/items", icon: <InventoryRounded /> },
  { label: "Ships & Vehicles", labelKey: "wiki.hub.sectionShips", route: "/wiki/ships", icon: <RocketLaunchRounded /> },
  { label: "Commodities", labelKey: "wiki.hub.sectionCommodities", route: "/wiki/commodities", icon: <ScienceRounded /> },
  { label: "Locations", labelKey: "wiki.hub.sectionLocations", route: "/wiki/locations", icon: <LocationOnRounded /> },
  { label: "Manufacturers", labelKey: "wiki.hub.sectionManufacturers", route: "/wiki/manufacturers", icon: <BusinessRounded /> },
  { label: "Refinery", labelKey: "wiki.hub.sectionRefinery", route: "/wiki/refinery", icon: <SettingsRounded /> },
  { label: "Missions", labelKey: "wiki.hub.sectionMissions", route: "/missions", icon: <AssignmentRounded /> },
  { label: "Blueprints", labelKey: "wiki.hub.sectionBlueprints", route: "/blueprints", icon: <DescriptionRounded /> },
  { label: "Crafting Calculator", labelKey: "wiki.hub.sectionCraftingCalculator", route: "/crafting/calculator", icon: <CalculateRounded /> },
  { label: "Resources", labelKey: "wiki.hub.sectionResources", route: "/resources", icon: <TerrainRounded /> },
  { label: "Mining", labelKey: "wiki.hub.sectionMining", route: "/mining", icon: <ConstructionRounded /> },
]

export function WikiHub() {
  const { t } = useTranslation()
  const theme: ExtendedTheme = useTheme()

  return (
    <StandardPageLayout
      title={t("wiki.hub.title", "Game Database — Star Citizen Items, Ships & More | SC Market")}
      description={t(
        "wiki.hub.description",
        "Browse the complete Star Citizen game database: items, ships, commodities, locations, manufacturers, blueprints, and mining resources.",
      )}
      canonicalUrl="/wiki"
      headerTitle={t("wiki.hub.header", "Game Database")}
      maxWidth="lg"
    >
      <Grid container spacing={2}>
        {WIKI_SECTIONS.map((section) => (
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
                    {section.icon}
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
