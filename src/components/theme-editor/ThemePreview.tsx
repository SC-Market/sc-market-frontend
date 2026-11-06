import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  ListItemButton,
  Paper,
  Skeleton,
  TextField,
  ThemeProvider,
  Typography,
  useTheme,
  type ThemeOptions,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import {
  themeBase,
  createAppTheme,
  mainThemeOptions,
  lightThemeOptions,
  navbarShadow,
  cardFadeGradient,
} from "../../hooks/styles/Theme"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { sanitizeThemeData } from "./sanitizeThemeData"

/** Sample listing strings — mirrors `ListingCard` layout, not real data. */
const PREVIEW_LISTING_PRICE = "12,500 aUEC"
/** Ship name (proper noun); the "(vehicle)" descriptor is translated at render. */
const PREVIEW_LISTING_SHIP = "Aurora MR"

interface ThemePreviewProps {
  themeData: ThemeOptions
  mode: "light" | "dark"
  faviconUrl?: string | null
}

function ThemePreviewInner({ faviconUrl }: { faviconUrl?: string | null }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navKind = theme.navKind ?? "outlined"
  const br = theme.borderRadius
  const outline =
    theme.palette.outline?.main ?? theme.palette.divider ?? "currentColor"

  const navSx = {
    p: 1,
    mb: 1.5,
    bgcolor: "background.navbar",
    display: "flex",
    alignItems: "center",
    gap: 1,
    borderRadius: 0,
    boxSizing: "border-box" as const,
    ...(navKind === "outlined"
      ? {
          border: 1,
          borderColor: outline,
          boxShadow: "none",
        }
      : {
          border: "none",
          boxShadow: navbarShadow(theme),
        }),
  }

  return (
    <>
      {/* Navbar — navKind + navbar bg + favicon */}
      <Box sx={navSx}>
        {faviconUrl ? (
          <Box
            component="img"
            src={faviconUrl}
            alt=""
            sx={{ width: 18, height: 18, flexShrink: 0 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              flexShrink: 0,
            }}
          />
        )}
        <Typography variant="subtitle2" color="text.primary" sx={{ flex: 1 }}>
          {t("theme.previewNavbar", "Navbar")}
        </Typography>
      </Box>

      {/* Paper surface (distinct from default bg) */}
      <Paper
        sx={{
          p: 1,
          mb: 1.5,
          bgcolor: "background.paper",
          border: 1,
          borderColor: outline,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("theme.previewPaperSurface", "Paper surface")}
        </Typography>
      </Paper>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        {/* Sidebar */}
        <Paper
          sx={{
            p: 1,
            bgcolor: "background.sidebar",
            width: 80,
            flexShrink: 0,
            border: 1,
            borderColor: outline,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("theme.previewSidebar", "Sidebar")}
          </Typography>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                height: 6,
                borderRadius: 0.5,
                mt: 0.5,
                bgcolor: (th) => alpha(th.palette.text.primary, 0.12),
              }}
            />
          ))}
        </Paper>

        {/* Main column */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Card>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Typography variant="caption" color="text.primary">
                {t("theme.previewCardContent", "Card content")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t("theme.previewSecondaryText", "Secondary text")}
              </Typography>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{
                fontSize: 10,
                py: 0.25,
                px: 1,
                minWidth: 0,
                borderRadius: theme.spacing(br.button),
              }}
            >
              {t("theme.previewPrimaryBtn", "Primary")}
            </Button>
            {/* Secondary is the buy side and premium: shown as a chip, the
                way bids and premium badges use it */}
            <Chip
              size="small"
              color="secondary"
              label={t("theme.previewSecondaryBtn", "Secondary")}
              sx={{ fontSize: 10, height: 22 }}
            />
          </Box>

          {/* Outline / border — matches Border color in editor */}
          <TextField
            size="small"
            variant="outlined"
            label={t("theme.previewOutlinedInput", "Border / input")}
            placeholder={t("theme.previewOutlineHint", "Uses border color")}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: 11,
              },
            }}
          />

          {/* action.hover — ListItemButton, MenuItem, Skeleton wave (not contained Button) */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
              {t(
                "theme.previewActionHoverLabel",
                "Menu & list hover (palette.action.hover)",
              )}
            </Typography>
            <ListItemButton
              dense
              sx={{
                py: 0.25,
                px: 0.75,
                borderRadius: 1,
                border: 1,
                borderColor: outline,
              }}
            >
              <Typography variant="caption" color="text.primary">
                {t("theme.previewNavRowHover", "Sidebar row (hover me)")}
              </Typography>
            </ListItemButton>
            <Skeleton
              variant="rounded"
              animation="wave"
              height={28}
              sx={{ mt: 0.75, borderRadius: 1 }}
            />
            <Typography
              variant="caption"
              color="text.disabled"
              display="block"
              sx={{ mt: 0.25 }}
            >
              {t(
                "theme.previewSkeletonWaveHint",
                "Skeleton “wave” shimmer uses this color, not filled button hover.",
              )}
            </Typography>
          </Box>

          {/* Market listing sample — matches `ListingCard`: RSI fallback art + cardFadeGradient (dark only) */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
              {t("theme.previewListingLabel", "Market listing (sample)")}
            </Typography>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                border: 1,
                borderColor: outline,
                borderRadius: theme.spacing(br.topLevel),
              }}
            >
              <Box
                component="img"
                src={FALLBACK_IMAGE_URL}
                alt=""
                sx={{
                  width: "100%",
                  aspectRatio: "16/9",
                  objectFit: "cover",
                  display: "block",
                  maxHeight: 140,
                }}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.opacity = "0.5"
                }}
              />
              {theme.palette.mode === "dark" && (
                <Box
                  sx={{
                    position: "absolute",
                    zIndex: 3,
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    borderRadius: theme.spacing(br.topLevel),
                    background: cardFadeGradient(theme, 50, 60),
                  }}
                />
              )}
              <CardContent
                sx={{
                  ...(theme.palette.mode === "dark"
                    ? {
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 4,
                      }
                    : {
                        py: 1,
                        px: 1.25,
                      }),
                  maxWidth: "100%",
                  padding: "8px 12px !important",
                  "&:last-child": { pb: "8px !important" },
                }}
              >
                <Typography
                  variant="caption"
                  color="primary"
                  fontWeight="bold"
                  display="block"
                >
                  {PREVIEW_LISTING_PRICE}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.3,
                  }}
                >
                  {t("chromeUi.themePreview.listingTitle", {
                    ship: PREVIEW_LISTING_SHIP,
                  })}
                </Typography>
              </CardContent>
            </Card>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mt: 0.5, display: "block", lineHeight: 1.35 }}
            >
              {theme.palette.mode === "light"
                ? t(
                    "theme.previewListingLightNote",
                    "Light mode: no image fade on listing cards (same as the live market).",
                  )
                : t(
                    "theme.previewListingDarkNote",
                    "Listing thumbnails fade using your Sidebar color (cardFadeGradient).",
                  )}
            </Typography>
          </Box>

          {/* background.imageOverlay — SelectPhotosArea-style photo grids; separate from listing card fades */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: 0.75,
                bgcolor: "background.imageOverlay",
                border: 1,
                borderColor: outline,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t(
                "theme.previewImageOverlayHint",
                "Photo grids like SelectPhotosArea; listing cards use Sidebar + card fade instead.",
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export function ThemePreview({
  themeData,
  mode,
  faviconUrl,
}: ThemePreviewProps) {
  const sanitized = sanitizeThemeData(themeData)
  const base =
    mode === "light"
      ? [themeBase, mainThemeOptions, lightThemeOptions, sanitized]
      : [themeBase, mainThemeOptions, sanitized]

  let previewTheme
  try {
    previewTheme = createAppTheme(...base)
  } catch {
    previewTheme = createAppTheme(themeBase, mainThemeOptions)
  }

  return (
    <ThemeProvider theme={previewTheme}>
      <Paper
        sx={{
          p: 2,
          bgcolor: "background.default",
          minHeight: 200,
          overflow: "hidden",
        }}
      >
        <ThemePreviewInner faviconUrl={faviconUrl} />
      </Paper>
    </ThemeProvider>
  )
}
