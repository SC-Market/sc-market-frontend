import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { OrderReview } from "../../../datatypes/Order"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"

export function NotificationOrderReview(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const review = useMemo(() => notif.entity as OrderReview, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${review.order_id}`}
      notif={notif}
    >
      {t("notifications.new_review_by")}{" "}
      <Link
        to={
          review.user_author
            ? `/user/${review.user_author.username}`
            : `/contractor/${review.contractor_author!.spectrum_id}`
        }
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>
          {review.user_author?.username ||
            review.contractor_author!.spectrum_id}
        </UnderlineLink>
      </Link>
    </NotificationBase>
  )
}
