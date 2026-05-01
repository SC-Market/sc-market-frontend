import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import { useGetListingDetailQuery } from "../../../store/api/v2/market"

interface BidV2Entity {
  bid_id: string
  listing_id: string
  amount: number
  user_bidder?: { username: string; display_name: string; avatar: string | null }
}

export function NotificationBidV2(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const bid = useMemo(() => notif.entity as unknown as BidV2Entity, [notif.entity])
  const { data: listing } = useGetListingDetailQuery({ id: bid.listing_id }, { skip: !bid.listing_id })
  const { t } = useTranslation()

  const bidderName = bid.user_bidder?.display_name || notif.actors?.[0]?.display_name || "Someone"
  const bidderLink = bid.user_bidder?.username
    ? `/user/${bid.user_bidder.username}`
    : notif.actors?.[0]?.username
      ? `/user/${notif.actors[0].username}`
      : "#"

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/market/${bid.listing_id}`}
      notif={notif}
    >
      {t("notifications.new_bid_placed_by")}{" "}
      <Link
        to={bidderLink}
        style={{ textDecoration: "none", color: theme.palette.secondary.main }}
      >
        <UnderlineLink>{bidderName}</UnderlineLink>
      </Link>{" "}
      {t("notifications.for")}{" "}
      <Link
        to={`/market/${bid.listing_id}`}
        style={{ textDecoration: "none", color: theme.palette.secondary.main }}
      >
        <UnderlineLink>{listing?.listing.title || "..."}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}
