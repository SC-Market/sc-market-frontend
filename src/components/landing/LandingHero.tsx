import React from "react"
import {
  Avatar,
  Box,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { useGetUserProfileQuery } from "../../store/profile"
import { LoginArea } from "../../views/authentication/LoginArea"
import logo from "../../assets/scmarket-logo.webp"

export function LandingHero() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const profile = useGetUserProfileQuery()

  return (
    <Box
      sx={{
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        backgroundPosition: "center",
        paddingBottom: theme.spacing(8),
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing(4),
        }}
      >
        <Stack
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{
            width: "100%",
            textAlign: "center",
            flex: { xs: "1 1 auto", md: "0 1 auto" },
          }}
        >
          <Avatar
            sx={{
              [theme.breakpoints.up("lg")]: {
                width: theme.spacing(32),
                height: theme.spacing(32),
              },
              [theme.breakpoints.down("lg")]: {
                width: theme.spacing(24),
                height: theme.spacing(24),
              },
            }}
            src={logo}
            alt={t("accessibility.scMarketLogo", "SC Market logo")}
          />
          <Typography color="secondary" variant="h1">
            <b>SC MARKET</b>
          </Typography>
          <Typography
            variant="h2"
            sx={{ width: "100%", textAlign: "center" }}
          >
            {t("landing.subtitle")}
          </Typography>
        </Stack>
        {!profile.data && (
          <Box
            sx={{
              width: { xs: "100%", md: "auto" },
              maxWidth: { xs: "100%", md: 480 },
              flex: { xs: "1 1 auto", md: "0 1 auto" },
            }}
          >
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent="center"
            >
              <LoginArea />
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  )
}
