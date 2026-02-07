import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Fade,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import type {
  ExtendedAggregateSearchResult,
  MarketAggregate,
} from "../../domain/types"
import { useMarketSidebarExp } from "../../hooks/MarketSidebar"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"

export function AggregateListing(props: {
  aggregate: ExtendedAggregateSearchResult
  index: number
}) {
  const { aggregate, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      sm={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={marketSidebarOpen ? 4 : 3}
      xxl={marketSidebarOpen ? 4.8 : 2.4}
      sx={{ transition: "0.3s" }}
    >
      <AggregateListingBase aggregate={aggregate} index={index} />
    </Grid>
  )
}

export function AggregateListingBase(props: {
  aggregate: ExtendedAggregateSearchResult
  index: number
}) {
  const { t } = useTranslation()
  const { aggregate, index } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { minimum_price, photo, quantity_available, title } = aggregate

  const cardHeight = isMobile ? 300 : 400
  const mediaHeight =
    theme.palette.mode === "dark" ? "100%" : isMobile ? 150 : 244

  const contentSx =
    theme.palette.mode === "dark"
      ? { position: "absolute" as const, bottom: 0, zIndex: 4 }
      : {}

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={`/market/aggregate/${aggregate.game_item_id}`}
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
              height: cardHeight,
              position: "relative",
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
                width: "100%",
                objectFit: "cover",
                aspectRatio: "16/9",
                ...(theme.palette.mode === "dark"
                  ? { height: "100%" }
                  : { height: mediaHeight }),
                overflow: "hidden",
              }}
              alt={`Image of ${title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light" ? { display: "none" } : {}),
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

            <Box sx={contentSx}>
              <CardContent
                sx={
                  isMobile
                    ? {
                        padding: "8px 12px !important",
                        "&:last-child": { pb: 1 },
                      }
                    : undefined
                }
              >
                <Typography
                  variant={isMobile ? "body1" : "h5"}
                  color="primary"
                  fontWeight="bold"
                  sx={isMobile ? { fontSize: "0.95rem", mb: 0.5 } : undefined}
                >
                  {minimum_price.toLocaleString(undefined)} aUEC
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    ...(isMobile
                      ? {
                          fontSize: "0.75rem",
                          lineHeight: 1.3,
                          maxHeight: 36,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          mb: 0.5,
                        }
                      : { maxHeight: 60 }),
                  }}
                >
                  {aggregate.title} ({aggregate.item_type})
                </Typography>
                <Typography
                  display="block"
                  color="text.primary"
                  variant="subtitle2"
                  sx={
                    isMobile
                      ? { fontSize: "0.7rem", lineHeight: 1.2 }
                      : undefined
                  }
                >
                  {quantity_available.toLocaleString(undefined)}{" "}
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

export function AggregateBuyOrderListing(props: {
  aggregate: MarketAggregate
  index: number
}) {
  const { aggregate, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      sm={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={marketSidebarOpen ? 4 : 3}
      xxl={marketSidebarOpen ? 4.8 : 2.4}
      sx={{ transition: "0.3s" }}
    >
      <AggregateBuyOrderListingBase aggregate={aggregate} index={index} />
    </Grid>
  )
}

export function AggregateBuyOrderListingBase(props: {
  aggregate: MarketAggregate
  index: number
}) {
  const { t } = useTranslation()
  const { aggregate, index } = props
  const { details, photos } = aggregate
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const maximum_price = useMemo(
    () =>
      aggregate.buy_orders.length
        ? (aggregate.buy_orders.reduce((prev, curr) =>
            (prev.price ?? 0) > (curr.price ?? 0) ? prev : curr,
          ).price ?? 0)
        : 0,
    [aggregate.buy_orders],
  )
  const minimum_price = useMemo(
    () =>
      aggregate.buy_orders.length
        ? (aggregate.buy_orders.reduce((prev, curr) =>
            (prev.price ?? 0) < (curr.price ?? 0) ? prev : curr,
          ).price ?? 0)
        : 0,
    [aggregate.buy_orders],
  )
  const sum_requested = useMemo(
    () => aggregate.buy_orders.reduce((prev, curr) => prev + curr.quantity, 0),
    [aggregate.buy_orders],
  )

  const cardHeight = isMobile ? 300 : 400
  const mediaHeight =
    theme.palette.mode === "dark" ? "100%" : isMobile ? 150 : 244
  const contentSx =
    theme.palette.mode === "dark"
      ? { position: "absolute" as const, bottom: 0, zIndex: 4 }
      : {}

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={`/market/aggregate/${aggregate.details.game_item_id}`}
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
              height: cardHeight,
              position: "relative",
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={photos[0] || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                ...(theme.palette.mode === "dark"
                  ? { height: "100%" }
                  : { height: mediaHeight }),
                overflow: "hidden",
              }}
              alt={`Image of ${details.title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light" ? { display: "none" } : {}),
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

            <Box sx={contentSx}>
              <CardContent
                sx={
                  isMobile
                    ? {
                        padding: "8px 12px !important",
                        "&:last-child": { pb: 1 },
                      }
                    : undefined
                }
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  color="primary"
                  fontWeight="bold"
                  sx={isMobile ? { fontSize: "0.95rem", mb: 0.5 } : undefined}
                >
                  {minimum_price.toLocaleString(undefined)} -{" "}
                  {maximum_price.toLocaleString(undefined)} aUEC/
                  {t("market.unit")}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    ...(isMobile
                      ? {
                          fontSize: "0.75rem",
                          lineHeight: 1.3,
                          maxHeight: 36,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          mb: 0.5,
                        }
                      : { maxHeight: 60 }),
                  }}
                >
                  {details.title} ({details.item_type})
                </Typography>
                <Typography
                  display="block"
                  color="text.primary"
                  variant="subtitle2"
                  sx={
                    isMobile
                      ? { fontSize: "0.7rem", lineHeight: 1.2 }
                      : undefined
                  }
                >
                  {sum_requested.toLocaleString(undefined)}{" "}
                  {t("market.total_requested")}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}
