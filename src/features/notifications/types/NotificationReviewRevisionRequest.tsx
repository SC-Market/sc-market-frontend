import { EditRounded } from "@mui/icons-material"
import { Notification } from "../../../hooks/login/UserProfile"
import { OrderReview } from "../../../datatypes/Order"
import { Trans, useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"

export function NotificationReviewRevisionRequest(props: {
  notif: Notification
}) {
  const { notif } = props
  const { t } = useTranslation()

  const reviewEntity =
    notif.entity &&
    typeof notif.entity === "object" &&
    "review_id" in notif.entity
      ? (notif.entity as OrderReview)
      : null

  const requester =
    notif.actors && notif.actors.length > 0 ? notif.actors[0] : null

  return (
    <NotificationBase
      icon={<EditRounded />}
      to={
        reviewEntity?.order_id ? `/order/${reviewEntity.order_id}` : undefined
      }
      notif={notif}
    >
      <Trans
        i18nKey="notifications.reviewRevisionRequested"
        values={{
          requester: requester?.username || "Unknown user",
          message: reviewEntity?.revision_message,
        }}
        components={{
          strong: <strong />,
          message: (
            <div style={{ fontStyle: "italic", marginTop: "4px" }}>
              reviewEntity?.revision_message
            </div>
          ),
        }}
      />
    </NotificationBase>
  )
}
