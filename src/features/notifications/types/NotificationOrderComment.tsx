import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { OrderComment } from "../../../datatypes/Order"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"

export function NotificationOrderComment(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const comment = useMemo(() => notif.entity as OrderComment, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${comment?.order_id}`}
      notif={notif}
    >
      {t("notifications.new_order_comment_by")}{" "}
      <Link
        to={`/user/${comment?.author?.username}`}
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
