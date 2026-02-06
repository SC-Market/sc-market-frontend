import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { OfferSession } from "../../../store/offer"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"

export function NotificationOfferMessage(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const offer = useMemo(() => notif.entity as OfferSession, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/offer/${offer.id}`}
      notif={notif}
    >
      {t("notifications.new_offer_message_from")}{" "}
      <Link
        to={`/user/${offer.customer.username}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{offer.customer.display_name}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}
