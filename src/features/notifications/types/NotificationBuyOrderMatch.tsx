import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { NotificationBase } from "../components/NotificationBase"
import { formatMarketUrl } from "../../market/domain/urls"

/** A new public listing matches one of the user's buy orders (entity: the listing). */
export function NotificationBuyOrderMatch(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const entity =
    notif.entity && "listing_id" in notif.entity
      ? (notif.entity as { listing_id: string; title?: string })
      : undefined
  const to =
    entity?.listing_id && entity.title
      ? formatMarketUrl({ listing_id: entity.listing_id, title: entity.title })
      : `/market/${entity?.listing_id ?? ""}`

  return (
    <NotificationBase
      icon={<ShoppingCartCheckoutRoundedIcon />}
      to={to}
      notif={notif}
    >
      {t("notifications.buy_order_match", "Buy-order match:")}{" "}
      <Link
        to={to}
        style={{ textDecoration: "none", color: theme.palette.secondary.main }}
      >
        <UnderlineLink>{entity?.title || "..."}</UnderlineLink>
      </Link>{" "}
      {t(
        "notifications.buy_order_match_listed",
        "matches one of your buy orders",
      )}
    </NotificationBase>
  )
}
