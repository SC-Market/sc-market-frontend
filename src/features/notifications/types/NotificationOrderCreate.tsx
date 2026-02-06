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

export function NotificationOrderCreate(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const order = useMemo(() => notif.entity as Order, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${order.order_id}`}
      notif={notif}
    >
      {t("notifications.new_order_placed_by")}{" "}
      <Link
        to={`/user/${order.customer}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{order.customer}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}
