import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"
import { ADMIN_PATHS } from "../../../routes/paths"

/**
 * Entity of a storefront_enquiry_created notification (backend
 * services/storefront/enquiries.ts enquiryNoticeEntity), sent to site admins.
 */
export interface StorefrontEnquiryNotice {
  enquiry_id: string
  target_type: "org" | "shop"
  target: string
  target_name: string
  requested_subdomain: string
  status: string
}

export function isStorefrontEnquiryNotice(
  entity: Notification["entity"] | undefined,
): entity is StorefrontEnquiryNotice {
  return !!entity && typeof entity === "object" && "enquiry_id" in entity && "requested_subdomain" in entity
}

/** Admins: an org or a shop asked for a branded storefront (Admin › Premium). */
export function NotificationStorefrontEnquiry(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()
  const notice = isStorefrontEnquiryNotice(notif.entity) ? notif.entity : null
  return (
    <NotificationBase
      icon={<StorefrontRoundedIcon />}
      to={`${ADMIN_PATHS.premium}#storefront-enquiries`}
      notif={notif}
    >
      {notice
        ? t("notifications.storefront_enquiry.created", {
            name: notice.target_name || notice.target,
            subdomain: `${notice.requested_subdomain}.sc-market.space`,
            defaultValue: "{{name}} asked for a branded storefront: {{subdomain}}",
          })
        : t("notifications.storefront_enquiry.generic", "New branded storefront enquiry")}
    </NotificationBase>
  )
}
