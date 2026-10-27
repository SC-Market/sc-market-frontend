import React from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import MenuBookRounded from "@mui/icons-material/MenuBookRounded"
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded"
import ScienceRounded from "@mui/icons-material/ScienceRounded"
import HardwareRounded from "@mui/icons-material/HardwareRounded"
import DescriptionRounded from "@mui/icons-material/DescriptionRounded"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../../routes/paths"
import { LandingSection, LandingSectionHeader } from "./LandingSection"

/** "Game data": one tile per game database, linking into each. Static. */
export function LandingGameData() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const tiles = [
    {
      to: WIKI_PATHS.items,
      icon: <MenuBookRounded />,
      title: t("landing.gameDataItems"),
      text: t("landing.gameDataItemsText"),
    },
    {
      to: WIKI_PATHS.ships,
      icon: <RocketLaunchRounded />,
      title: t("landing.gameDataShips"),
      text: t("landing.gameDataShipsText"),
    },
    {
      to: GAME_DATA_PATHS.blueprints,
      icon: <ScienceRounded />,
      title: t("landing.gameDataBlueprints"),
      text: t("landing.gameDataBlueprintsText"),
    },
    {
      to: GAME_DATA_PATHS.mining,
      icon: <HardwareRounded />,
      title: t("landing.gameDataMining"),
      text: t("landing.gameDataMiningText"),
    },
    {
      to: GAME_DATA_PATHS.missions,
      icon: <DescriptionRounded />,
      title: t("landing.gameDataMissions"),
      text: t("landing.gameDataMissionsText"),
    },
  ]
  return (
    <LandingSection labelledBy="landing-game-data-title" testId="landing-game-data">
      <LandingSectionHeader
        id="landing-game-data-title"
        title={t("landing.gameDataHeading")}
        actions={
          <Button
            component={Link}
            to={WIKI_PATHS.hub}
            variant="outlined"
            color="secondary"
          >
            {t("landing.gameDataOpenWiki")}
          </Button>
        }
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {tiles.map((tile, i) => (
          <Paper
            key={tile.to}
            component={Link}
            to={tile.to}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 2,
              minWidth: 0,
              textDecoration: "none",
              color: "text.secondary",
              transition: theme.transitions.create([
                "border-color",
                "background-color",
              ]),
              "&:hover": {
                borderColor: alpha(theme.palette.text.secondary, 0.3),
                bgcolor: "action.hover",
              },
              "& > svg": { color: "secondary.main", flexShrink: 0 },
              // Phones: two columns, the odd last tile takes the row.
              ...(i === tiles.length - 1
                ? { gridColumn: { xs: "span 2", sm: "auto" } }
                : {}),
            }}
          >
            {tile.icon}
            <Box sx={{ minWidth: 0 }}>
              <Typography component="span" sx={{ display: "block" }}>
                {tile.title}
              </Typography>
              <Typography
                component="span"
                color="text.primary"
                sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.4 }}
              >
                {tile.text}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </LandingSection>
  )
}
