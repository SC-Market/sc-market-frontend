import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Typography, Chip, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import { formatPrice } from "../../../util/formatPrice"
import { ORDER_PATHS, USER_PATHS } from "../../../routes/paths"

interface OfferEntity {
  id?: string
  session_id?: string
  customer: { username: string; display_name: string }
  offers: Array<{
    cost: string | number
    title: string
    market_listings?: Array<{ listing_id: string; quantity: number; listing?: { details?: { title?: string } }; title?: string }>
    market_listings_v2?: Array<{ listing_id: string; title: string; quantity: number }>
    v2_variant_items?: Array<{ listing_id: string; quantity: number }>
    service?: { title: string; service_id: string } | null
  }>
}

export function NotificationOfferCreate(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const offer = useMemo(() => notif.entity as OfferEntity, [notif.entity])
  const { t } = useTranslation()

  const sessionId = offer.session_id || offer.id
  const latestOffer = offer.offers?.[0]

  // Build item summary from V2 or V1 data
  const itemSummary = useMemo(() => {
    if (!latestOffer) return null

    // V2 market listings (have title directly)
    if (latestOffer.market_listings_v2?.length) {
      return latestOffer.market_listings_v2.map((ml) => ({
        title: ml.title,
        quantity: ml.quantity,
      }))
    }

    // V2 variant items (count by listing)
    if (latestOffer.v2_variant_items?.length) {
      const grouped = new Map<string, number>()
      for (const vi of latestOffer.v2_variant_items) {
        grouped.set(vi.listing_id, (grouped.get(vi.listing_id) || 0) + vi.quantity)
      }
      return Array.from(grouped.entries()).map(([listing_id, quantity]) => ({
        title: listing_id.substring(0, 8),
        quantity,
      }))
    }

    // V1 market listings
    if (latestOffer.market_listings?.length) {
      return latestOffer.market_listings.map((ml) => ({
        title: ml.title || (ml.listing as { details?: { title?: string } })?.details?.title || "Item",
        quantity: ml.quantity,
      }))
    }

    return null
  }, [latestOffer])

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={ORDER_PATHS.offer(sessionId as string)}
      notif={notif}
    >
      {notif.action === "offer_create"
        ? t("notifications.new_offer_received_from")
        : t("notifications.counter_offer_received_from")}{" "}
      <Link
        to={USER_PATHS.profile(offer.customer.username)}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{offer.customer.display_name}</UnderlineLink>
      </Link>
      {latestOffer && (
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
          <Chip
            label={formatPrice(Number(latestOffer.cost))}
            size="small"
            color="primary"
            variant="outlined"
          />
          {latestOffer.service && (
            <Chip label={latestOffer.service.title} size="small" variant="outlined" />
          )}
          {itemSummary?.map((item, i) => (
            <Chip
              key={i}
              label={`${item.title} ×${item.quantity}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      )}
    </NotificationBase>
  )
}
