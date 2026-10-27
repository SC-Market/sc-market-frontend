import React from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import StorefrontRounded from "@mui/icons-material/StorefrontRounded"
import BuildRounded from "@mui/icons-material/BuildRounded"
import ShoppingCartRounded from "@mui/icons-material/ShoppingCartRounded"
import EditRounded from "@mui/icons-material/EditRounded"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MARKET_PATHS } from "../../routes/paths"
import { landingSellHref } from "./landingLinks"

interface Intent {
  id: "buy" | "hire" | "wanted" | "sell"
  title: string
  text: string
  action: string
  href: string
  icon: React.ReactElement<{ sx?: object }>
  color: "primary" | "secondary"
  variant: "contained" | "outlined"
  /** The Sell card: outlined in primary. */
  highlight?: boolean
}

/**
 * The four things a visitor comes to do, straight under the hero search:
 * Buy, Hire, Wanted (post a buy order) and Sell. Each card's button is its
 * link; its ::after covers the card, so the whole card is the click target
 * with one accessible name. Four across from lg, 2×2 below.
 */
export function LandingIntents(props: { signedIn: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const intents: Intent[] = [
    {
      id: "buy",
      title: t("landing.intentBuyTitle"),
      text: t("landing.intentBuyText"),
      action: t("landing.intentBuyAction"),
      href: MARKET_PATHS.search,
      icon: <StorefrontRounded />,
      color: "primary",
      variant: "contained",
    },
    {
      id: "hire",
      title: t("landing.intentHireTitle"),
      text: t("landing.intentHireText"),
      action: t("landing.intentHireAction"),
      href: MARKET_PATHS.services,
      icon: <BuildRounded />,
      color: "primary",
      variant: "outlined",
    },
    {
      id: "wanted",
      title: t("landing.intentWantedTitle"),
      text: t("landing.intentWantedText"),
      action: t("landing.intentWantedAction"),
      href: MARKET_PATHS.buyOrderCreate,
      icon: <ShoppingCartRounded />,
      color: "secondary",
      variant: "outlined",
    },
    {
      id: "sell",
      title: t("landing.intentSellTitle"),
      text: t("landing.intentSellText"),
      action: t("landing.intentSellAction"),
      href: landingSellHref(props.signedIn),
      icon: <EditRounded />,
      color: "secondary",
      variant: "contained",
      highlight: true,
    },
  ]

  return (
    <Box
      component="nav"
      aria-label={t("landing.intentsLabel")}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: { xs: 1, sm: 1.5 },
      }}
    >
      {intents.map((intent) => (
        <Paper
          key={intent.id}
          data-testid="landing-intent"
          data-id={intent.id}
          sx={{
            position: "relative",
            display: { xs: "flex", sm: "grid" },
            flexDirection: "column",
            alignItems: { xs: "stretch", sm: "center" },
            gridTemplateColumns: "minmax(0, 1fr) auto",
            columnGap: 1,
            rowGap: 0.25,
            gap: { xs: 0.5 },
            p: { xs: 1.5, sm: "12px 14px" },
            transition: theme.transitions.create("border-color"),
            "&:hover": { borderColor: alpha(theme.palette.text.secondary, 0.3) },
            ...(intent.highlight
              ? {
                  borderColor: "primary.main",
                  boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
                  "&:hover": { borderColor: "primary.main" },
                }
              : {}),
          }}
        >
          <Typography
            component="h3"
            color="text.secondary"
            sx={{
              gridColumn: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: "bold",
              fontSize: "1.1rem",
              lineHeight: 1.3,
            }}
          >
            {React.cloneElement(intent.icon, {
              sx: { fontSize: 20, color: `${intent.color}.main` },
            })}
            {intent.title}
          </Typography>
          <Typography
            variant="caption"
            component="p"
            color="text.primary"
            sx={{
              gridColumn: 1,
              fontSize: "0.75rem",
              lineHeight: 1.3,
              mb: { xs: 0.75, sm: 0 },
            }}
          >
            {intent.text}
          </Typography>
          <Button
            component={Link}
            to={intent.href}
            variant={intent.variant}
            color={intent.color}
            size="small"
            sx={{
              gridColumn: 2,
              gridRow: "1 / 3",
              alignSelf: { xs: "flex-start", sm: "center" },
              whiteSpace: "nowrap",
              fontSize: { xs: 12, sm: 13, lg: 12 },
              px: { lg: 1 },
              position: "static",
              // The whole card is the link's click target.
              "&::after": { content: '""', position: "absolute", inset: 0 },
            }}
          >
            {intent.action}
          </Button>
        </Paper>
      ))}
    </Box>
  )
}
