import React from "react"
import { Avatar, Box, Container, Grid, Skeleton, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { LoginArea } from "../../views/authentication/LoginArea"
import logo from "../../assets/scmarket-logo.webp"

/**
 * What the hero shows next to the brand:
 * - "card": the sign-in card (logged out);
 * - "placeholder": a skeleton exactly the sign-in card's size, while the
 *   session is unknown. A returning signed-in visitor has a cached profile and
 *   is never "unknown", so the unknown state is almost always a logged-out
 *   visitor: reserving the card keeps the 2-column layout from jumping;
 * - "none": signed in, the brand is centered on its own.
 */
export type LandingHeroSignIn = "card" | "placeholder" | "none"

/**
 * The homepage hero, shared by the page and its skeletons so the loading
 * state has the loaded layout at every breakpoint. The brand (logo, name,
 * subtitle) is static, so it is always real.
 */
export function LandingHeroLayout({ signIn }: { signIn: LandingHeroSignIn }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

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
          {/* The brand line keeps the h1 look, but the page's one <h1> is
              the keyword subtitle (landing.subtitle). */}
          <Typography color="secondary" variant="h1" component="p">
            <b>SC MARKET</b>
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{ width: "100%", textAlign: "center" }}
          >
            {t("landing.subtitle")}
          </Typography>
        </Stack>
        {signIn !== "none" && (
          <Box
            sx={{
              width: { xs: "100%", md: "auto" },
              maxWidth: { xs: "100%", md: 480 },
              flex: { xs: "1 1 auto", md: "0 1 auto" },
              position: "relative",
            }}
          >
            {/* The placeholder lays the real card out invisibly (inert, hidden
                from assistive tech) so it takes exactly the card's size. */}
            <Box
              {...(signIn === "placeholder"
                ? { "aria-hidden": true, inert: true, sx: { visibility: "hidden" } }
                : {})}
            >
              <Grid
                container
                spacing={theme.layoutSpacing.layout}
                justifyContent="center"
              >
                <LoginArea />
              </Grid>
            </Box>
            {signIn === "placeholder" && (
              <Skeleton
                variant="rounded"
                data-testid="landing-signin-placeholder"
                sx={{ position: "absolute", inset: 0, height: "auto" }}
              />
            )}
          </Box>
        )}
      </Container>
    </Box>
  )
}
