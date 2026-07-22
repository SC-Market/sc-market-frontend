import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import type { OrderComment } from "../../orders/domain/types"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import { ORDER_PATHS, USER_PATHS } from "../../../routes/paths"

export function NotificationOrderComment(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const comment = useMemo(() => notif.entity as OrderComment, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={ORDER_PATHS.contract(comment?.order_id)}
      notif={notif}
    >
      {t("notifications.new_order_comment_by")}{" "}
      <Link
        to={USER_PATHS.profile(comment?.author?.username)}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{comment?.author?.username}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}
