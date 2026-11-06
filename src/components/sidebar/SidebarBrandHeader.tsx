import { Avatar, Box, IconButton, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ChevronLeftRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import scMarketLogo from "../../assets/scmarket-logo.webp"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { PATHS } from "../../routes/paths"

/**
 * The desktop sidebar's header: the site logo, or on an org's white-label
 * subdomain the org's logo and name; and the close button.
 */
export function SidebarBrandHeader({
  whiteLabelBrand,
  onClose,
}: {
  whiteLabelBrand: { name: string; logo: string | undefined } | null
  onClose: () => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  return (
    <>
      {/* Site logo header — matches V1 SidebarHeader */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, minHeight: 64 }}
      >
        {whiteLabelBrand ? (
          // An org's white-label subdomain: its logo and name, and that the
          // storefront is on SC Market.
          <Box
            component={Link}
            to={PATHS.home}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
            data-testid="sidebar-org-brand"
          >
            <Avatar
              src={whiteLabelBrand.logo}
              alt=""
              variant="rounded"
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={600}
                fontFamily={theme.typography.fontFamilyHeading}
                color="text.secondary"
                noWrap
              >
                {whiteLabelBrand.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.primary"
                noWrap
                component="div"
              >
                {t("storefront.onScMarket", "Storefront on SC Market")}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            component={Link}
            to={PATHS.home}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {/* Decorative: the link's text says "SC Market". The hashed webp
                (13 KB, also the home hero's logo) instead of the 512px PNG. */}
            <Avatar
              src={scMarketLogo}
              alt=""
              variant="rounded"
              sx={{ width: 40, height: 40 }}
            />
            <Typography
              fontWeight={600}
              fontFamily={theme.typography.fontFamilyHeading}
              color="text.primary"
            >
              {t("sidebar.sc_market.title", "SC Market")}
            </Typography>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "text.secondary" }}
          aria-label={t("sidebar.close", "Close sidebar")}
        >
          <ChevronLeftRounded />
        </IconButton>
      </Stack>
    </>
  )
}
