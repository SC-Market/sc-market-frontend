import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Fade,
  Grid,
  Typography,
} from "@mui/material"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import type { ExtendedMultipleSearchResult } from "../../domain/types"
import { formatMarketMultipleUrl } from "../../domain/urls"
import { useMarketSidebarExp } from "../../hooks/MarketSidebar"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import {
  getColorHex,
  getContrastColor,
  isComponentItem,
  isArmorItem,
} from "../../utils/attributeDisplay"

export function MultipleListing(props: {
  multiple: ExtendedMultipleSearchResult
  index: number
}) {
  const { multiple, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      sm={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={3}
      sx={{ transition: "0.3s" }}
    >
      <MultipleListingBase multiple={multiple} index={index} />
    </Grid>
  )
}

export function MultipleListingBase(props: {
  multiple: ExtendedMultipleSearchResult
  index: number
}) {
  const { t } = useTranslation()
  const { multiple, index } = props
  const { photo, title } = multiple
  const theme = useTheme<ExtendedTheme>()

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={formatMarketMultipleUrl(multiple)}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea
          sx={{
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: (theme) =>
                theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
              height: 400,
              postition: "relative",
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={photo || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      height: "100%",
                    }
                  : {
                      height: 244,
                    }),
                overflow: "hidden",
              }}
              alt={`Image of ${title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light"
                  ? {
                      display: "none",
                    }
                  : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: (theme) =>
                  theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
                background: `linear-gradient(to bottom, transparent, transparent 25%, ${theme.palette.background.sidebar}AA 40%, ${theme.palette.background.sidebar} 100%)`,
              }}
            />

            <Box
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      position: "absolute",
                      bottom: 0,
                      zIndex: 4,
                    }
                  : {}),
              }}
            >
              <CardContent>
                <Typography
                  variant={"h5"}
                  color={"primary"}
                  fontWeight={"bold"}
                >
                  {t("market.starting_at", {
                    price: multiple.minimum_price.toLocaleString(undefined),
                  })}{" "}
                  aUEC
                </Typography>
                <Typography
                  variant={"subtitle2"}
                  color={"text.secondary"}
                  maxHeight={60}
                >
                  <span
                    style={{
                      lineClamp: "2",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                    }}
                  >
                    {title} ({multiple.item_type})
                  </span>{" "}
                </Typography>
                
                {/* Component Attributes */}
                {multiple.attributes && (isComponentItem(multiple.attributes) || isArmorItem(multiple.attributes)) && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                      mb: 0.5,
                    }}
                  >
                    {multiple.attributes.component_size && (
                      <Chip
                        label={`Size ${multiple.attributes.component_size}`}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                    {multiple.attributes.component_grade && multiple.attributes.component_type !== "Ship Weapon" && (
                      <Chip
                        label={`Grade ${multiple.attributes.component_grade}`}
                        size="small"
                        color="secondary"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                    {multiple.attributes.component_class && (
                      <Chip
                        label={multiple.attributes.component_class}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                    {multiple.attributes.armor_class && (
                      <Chip
                        label={`${multiple.attributes.armor_class} Armor`}
                        size="small"
                        color="info"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                    {multiple.attributes.color && (
                      <Chip
                        label={multiple.attributes.color}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          backgroundColor: getColorHex(multiple.attributes.color),
                          color: getContrastColor(multiple.attributes.color),
                        }}
                      />
                    )}
                  </Box>
                )}
                
                {multiple.attributes?.manufacturer && (
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.875rem",
                      mb: 0.25,
                    }}
                  >
                    {multiple.attributes.manufacturer}
                  </Typography>
                )}
                {multiple.attributes?.component_type && (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      fontSize: "0.875rem",
                      mb: 0.25,
                    }}
                  >
                    {multiple.attributes.component_type}
                  </Typography>
                )}
                
                <Typography
                  display={"block"}
                  color={"text.primary"}
                  variant={"subtitle2"}
                >
                  {multiple.quantity_available.toLocaleString(undefined)}{" "}
                  {t("market.total_available")}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}
