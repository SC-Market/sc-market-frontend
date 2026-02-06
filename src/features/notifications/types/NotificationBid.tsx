import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import {
  DatatypesMarketBid,
  useGetMarketListingQuery,
} from "../../../features/market"

export function NotificationBid(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const bid = useMemo(
    () => notif.entity as unknown as DatatypesMarketBid,
    [notif.entity],
  )
  const { data: listing } = useGetMarketListingQuery(bid.listing_id)
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/market/${bid.listing_id}`}
      notif={notif}
    >
      {t("notifications.new_bid_placed_by")}{" "}
      <Link
        to={
          bid.user_bidder
            ? `/user/${bid.user_bidder.username}`
            : `/contractor/${bid.contractor_bidder?.spectrum_id}`
        }
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>
          {bid.user_bidder
            ? bid.user_bidder.display_name
            : bid.contractor_bidder!.name}
        </UnderlineLink>
      </Link>{" "}
      {t("notifications.for")}{" "}
      <Link
        to={`/market/${bid.listing_id}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{listing?.details.title}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}
