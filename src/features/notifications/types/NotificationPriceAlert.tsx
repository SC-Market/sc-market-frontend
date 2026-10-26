import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import PriceChangeRoundedIcon from "@mui/icons-material/PriceChangeRounded"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { NotificationBase } from "../components/NotificationBase"
import { useGetListingDetailQuery } from "../../../store/api/v2/market"
import { formatMarketUrl } from "../../market/domain/urls"

/** Watchlist price alert: a public listing hit the user's target price. */
export function NotificationPriceAlert(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const listingId =
    notif.entity && "listing_id" in notif.entity
      ? notif.entity.listing_id
      : undefined
  const { data: detail } = useGetListingDetailQuery(
    { id: listingId ?? "" },
    { skip: !listingId },
  )

  const title = detail?.listing.title
  const to =
    listingId && title
      ? formatMarketUrl({ listing_id: listingId, title })
      : `/market/${listingId ?? ""}`

  return (
    <NotificationBase icon={<PriceChangeRoundedIcon />} to={to} notif={notif}>
      {t("notifications.price_alert", "Price alert:")}{" "}
      <Link
        to={to}
        style={{ textDecoration: "none", color: theme.palette.secondary.main }}
      >
        <UnderlineLink>{title || "..."}</UnderlineLink>
      </Link>{" "}
      {t(
        "notifications.price_alert_hit_target",
        "is listed at or below your target price",
      )}
    </NotificationBase>
  )
}
