import React from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import EditRounded from "@mui/icons-material/EditRounded"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import logo96 from "../../assets/scmarket-logo-96.webp"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { PATHS } from "../../routes/paths"
import { LandingImg } from "./LandingImage"
import { LandingSectionTitle } from "./LandingTypography"
import { LANDING_SECTION_TITLE_SX } from "./LandingSection"
import { landingSellHref, loginGatedHref } from "./landingLinks"

/** An illustration (not a screenshot) of the Discord bot's order alert. */
function OrderAlertIllustration() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const fields = [
    [t("landing.alertQuantity"), "1"],
    [t("landing.alertTotal"), "500K aUEC"],
    [t("landing.alertBuyer"), "@buyer"],
    [t("landing.alertStatus"), t("landing.alertStatusValue")],
  ]
  return (
    <Paper
      role="img"
      aria-label={t("landing.alertImageLabel")}
      sx={{ p: 2, bgcolor: "background.default" }}
    >
      <Box
        aria-hidden
        sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}
      >
        <LandingImg
          src={logo96}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          sx={{ width: 32, height: 32, borderRadius: "50%" }}
        />
        <Typography variant="body2" color="text.secondary">
          SC Market
        </Typography>
        <Box
          component="span"
          sx={{
            bgcolor: "secondary.dark",
            color: "common.white",
            fontSize: 10,
            lineHeight: 1.5,
            px: 0.625,
            borderRadius: theme.spacing(theme.borderRadius.chip),
          }}
        >
          APP
        </Box>
      </Box>
      <Box
        aria-hidden
        sx={{
          borderLeft: 4,
          borderColor: "primary.main",
          bgcolor: "background.paper",
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          px: 1.75,
          py: 1.5,
        }}
      >
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {t("landing.alertTitle", { item: 'R97 "Scorched" Shotgun' })}
        </Typography>
        <Box
          component="dl"
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 2,
            rowGap: 0.5,
            m: 0,
          }}
        >
          {fields.map(([term, value]) => (
            <Box key={term}>
              <Typography component="dt" variant="body2" color="text.primary">
                {term}
              </Typography>
              <Typography
                component="dd"
                variant="body2"
                color="text.secondary"
                sx={{ m: 0, mb: 0.75 }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Typography
        aria-hidden
        variant="caption"
        component="p"
        sx={{ mt: 1.25, color: "text.subtle" }}
      >
        {t("landing.alertNote")}
      </Typography>
    </Paper>
  )
}

/**
 * "Start selling": how selling works (list, Discord alert, meet in game) and
 * the two seller CTAs, beside an illustrated order alert. Static.
 */
export function StartSelling(props: { signedIn: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const steps = [
    [t("landing.sellStep1Title"), t("landing.sellStep1Text")],
    [t("landing.sellStep2Title"), t("landing.sellStep2Text")],
    [t("landing.sellStep3Title"), t("landing.sellStep3Text")],
  ]
  return (
    <Paper
      component="section"
      aria-labelledby="landing-start-selling-title"
      data-testid="landing-start-selling"
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          lg: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
        },
        gap: 4,
        alignItems: "center",
        p: { xs: 2.5, sm: 4 },
        background: `radial-gradient(at 100% 0%, ${alpha(
          theme.palette.primary.main,
          0.2,
        )} 0px, transparent 55%), ${theme.palette.background.paper}`,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <LandingSectionTitle
          id="landing-start-selling-title"
          sx={{ ...LANDING_SECTION_TITLE_SX, mb: 1.25 }}
        >
          {t("landing.sellTitle")}
        </LandingSectionTitle>
        <Typography color="text.primary">{t("landing.sellText")}</Typography>
        <Box
          component="ol"
          sx={{ listStyle: "none", p: 0, my: 2.5, display: "grid", gap: 1.75 }}
        >
          {steps.map(([title, text], i) => (
            <Box
              component="li"
              key={title}
              sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}
            >
              <Box
                aria-hidden
                sx={{
                  flex: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontWeight: "bold",
                }}
              >
                {i + 1}
              </Box>
              <Box>
                <Typography color="text.secondary">{title}</Typography>
                <Typography variant="body2" color="text.primary">
                  {text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            component={Link}
            to={landingSellHref(props.signedIn)}
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<EditRounded />}
          >
            {t("landing.intentSellAction")}
          </Button>
          <Button
            component={Link}
            to={loginGatedHref(PATHS.orgRegister, props.signedIn)}
            variant="outlined"
            color="secondary"
            size="large"
          >
            {t("landing.sellRegisterOrg")}
          </Button>
        </Box>
      </Box>
      <OrderAlertIllustration />
    </Paper>
  )
}
