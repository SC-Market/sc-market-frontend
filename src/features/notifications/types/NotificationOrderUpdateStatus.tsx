import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { UpdateRounded } from "@mui/icons-material"
import { Notification } from "../../../hooks/login/UserProfile"
import { Order } from "../../../datatypes/Order"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"

export function NotificationOrderUpdateStatus(props: { notif: Notification }) {
  const theme = useTheme<ExtendedTheme>()
  const { notif } = props
  const order = useMemo(() => notif.entity as Order, [notif.entity])
  const status = notif.action
    .replaceAll("order_status_", "")
    .replaceAll("_", "-") as
    | "fulfilled"
    | "in-progress"
    | "not-started"
    | "cancelled"
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<UpdateRounded />}
      to={`/contract/${order.order_id}`}
      notif={notif}
    >
      {t("notifications.order_status_updated_to", { status })}{" "}
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
