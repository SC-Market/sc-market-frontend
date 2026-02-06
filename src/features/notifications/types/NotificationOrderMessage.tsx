import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { Order } from "../../../datatypes/Order"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"

export function NotificationOrderMessage(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const comment = useMemo(() => notif.entity as Order, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${comment.order_id}`}
      notif={notif}
    >
      {t("notifications.new_order_message_by")}{" "}
      <Link
        to={`/user/${notif.actors[0].username}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{notif.actors[0].username}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}
