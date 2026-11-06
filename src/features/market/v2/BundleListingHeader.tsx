import React from "react"

import {
  Breadcrumbs,
  CardHeader,
  Chip,
  IconButton,
  Link as MaterialLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material"

import { Link } from "react-router-dom"

import { useTheme } from "@mui/material/styles"

import { ExtendedTheme } from "../../../hooks/styles/Theme"

import {
  CreateRounded,
  PersonRounded,
  RefreshRounded,
  ZoomInRounded,
} from "@mui/icons-material"

import { ClockAlert } from "mdi-material-ui"

import { ListingNameAndRating } from "../../../components/rating/ListingRating"

import { ImagePreviewModal } from "../../../components/modal/ImagePreviewModal"

import { ListingDetailItem } from "../listing-view/components/ListingDetailItem"

import { dateDiffInDays } from "../../../util/dateDiff"

import { subDays } from "date-fns"

import { useTranslation } from "react-i18next"

import { MARKET_PATHS } from "../../../routes/paths"

import { useFormatters, useNow } from "../../../util/format"

import type { BundleItemV2, BundleListingV2 } from "./bundleListing"

/** The bundle's product image; clicking it toggles the zoom modal. */
export function BundleImagePanel({
  photos,
  title,
  open,
  setOpen,
}: {
  photos: string[]
  title: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <>
      <ImagePreviewModal
        images={photos}
        open={open}
        onClose={() => setOpen(false)}
      />
      <Paper
        sx={{
          borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
          backgroundColor: theme.palette.background.default,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          maxHeight: 600,
          height: 400,
          width: "100%",
          position: "relative",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <IconButton
          sx={{ top: 4, right: 4, position: "absolute" }}
          aria-label={t("MarketMultipleView.zoomImage", "Zoom image")}
        >
          <ZoomInRounded />
        </IconButton>
        <img
          loading="lazy"
          style={{
            display: "block",
            maxHeight: "100%",
            maxWidth: "100%",
            margin: "auto",
          }}
          src={photos[0]}
          alt={t(
            "marketMultipleView.productImage",
            "Product image for {{title}}",
            {
              title: title,
            },
          )}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src =
              "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
          }}
        />
      </Paper>
    </>
  )
}

/** Card header: breadcrumbs, title, seller and listing dates, edit action. */
export function BundleListingHeader({
  listing,
  currentItem,
  canManage,
}: {
  listing: BundleListingV2
  currentItem: BundleItemV2
  canManage: boolean
}) {
  const fmt = useFormatters()
  const now = useNow()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <CardHeader
      disableTypography
      sx={{
        padding: 3,
        paddingBottom: 0,
      }}
      title={
        <Stack
          direction={"column"}
          alignItems={"left"}
          spacing={theme.layoutSpacing.compact}
          justifyContent={"left"}
        >
          <Breadcrumbs
            aria-label={t("ui.aria.breadcrumb")}
            color={"text.primary"}
          >
            <MaterialLink
              component={Link}
              underline="hover"
              color="inherit"
              to={MARKET_PATHS.search}
            >
              {t("MarketMultipleView.market")}
            </MaterialLink>
            <MaterialLink
              component={Link}
              underline="hover"
              color="inherit"
              to={`/market?type=${encodeURIComponent(
                currentItem.game_item.type,
              )}`}
            >
              {currentItem.game_item.type}
            </MaterialLink>
            {currentItem.game_item.name && (
              <MaterialLink
                component={Link}
                underline="hover"
                color="text.secondary"
                to={`/market?query=${encodeURIComponent(
                  currentItem.game_item.name,
                )}`}
              >
                {currentItem.game_item.name}
              </MaterialLink>
            )}
          </Breadcrumbs>
          <Typography
            sx={{
              marginRight: 1,
              display: "flex",
              alignItems: "center",
            }}
            variant={"h5"}
            color={"text.secondary"}
            fontWeight={"bold"}
          >
            {listing.title}{" "}
            <Typography display={"inline"} sx={{ marginLeft: 1 }}>
              {dateDiffInDays(new Date(now), new Date(listing.created_at)) <=
                1 && (
                <Chip
                  variant="outlined"
                  label={t("MarketMultipleView.new")}
                  sx={{
                    marginRight: 1,
                    textTransform: "uppercase",
                    fontSize: "0.85em",
                    fontWeight: "bold",
                  }}
                />
              )}
            </Typography>
          </Typography>
        </Stack>
      }
      subheader={
        <Stack direction={"column"} alignItems={"left"}>
          <ListingDetailItem icon={<PersonRounded fontSize={"inherit"} />}>
            <ListingNameAndRating
              shop={{
                name: listing.seller.name,
                slug: listing.seller.slug,
                rating: listing.seller.rating.avg_rating,
              }}
            />
          </ListingDetailItem>
          <ListingDetailItem icon={<CreateRounded fontSize={"inherit"} />}>
            {t("MarketMultipleView.listed")}{" "}
            {fmt.relative(new Date(listing.created_at), now)}
          </ListingDetailItem>
          <ListingDetailItem icon={<RefreshRounded fontSize={"inherit"} />}>
            {t("MarketMultipleView.updated")}{" "}
            {fmt.relative(subDays(new Date(listing.expires_at), 30), now)}
          </ListingDetailItem>
          <ListingDetailItem icon={<ClockAlert fontSize={"inherit"} />}>
            {t("MarketMultipleView.expires")}{" "}
            {fmt.relative(new Date(listing.expires_at), now)}
          </ListingDetailItem>
        </Stack>
      }
      action={
        canManage ? (
          <Link to={MARKET_PATHS.multipleEdit(listing.listing_id)}>
            <IconButton
              aria-label={t("MarketMultipleView.editListing", "Edit listing")}
            >
              <CreateRounded
                style={{
                  color: theme.palette.text.secondary,
                }}
              />
            </IconButton>
          </Link>
        ) : undefined
      }
    />
  )
}
