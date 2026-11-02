import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"
import { ADMIN_PATHS, ORG_PATHS, SHOP_PATHS } from "../../../routes/paths"

/**
 * Entity of a storefront enquiry notification (backend
 * services/storefront/enquiries.ts enquiryNoticeEntity): created (to site
 * admins), accepted or declined (to the person who sent it).
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
  return (
    !!entity &&
    typeof entity === "object" &&
    "enquiry_id" in entity &&
    "requested_subdomain" in entity
  )
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
            defaultValue:
              "{{name}} asked for a branded storefront: {{subdomain}}",
          })
        : t(
            "notifications.storefront_enquiry.generic",
            "New branded storefront enquiry",
          )}
    </NotificationBase>
  )
}

/**
 * To the person who sent an enquiry: staff accepted it (the storefront is set
 * up) or declined it. Opens the org's Storefront settings or the shop's settings.
 */
export function NotificationStorefrontEnquiryDecision(props: {
  notif: Notification
}) {
  const { notif } = props
  const { t } = useTranslation()
  const notice = isStorefrontEnquiryNotice(notif.entity) ? notif.entity : null
  const accepted = notif.action === "storefront_enquiry_accepted"
  const to = notice
    ? notice.target_type === "org"
      ? ORG_PATHS.manageStorefront(notice.target)
      : SHOP_PATHS.settings(notice.target)
    : undefined
  const values = notice
    ? {
        name: notice.target_name || notice.target,
        subdomain: `${notice.requested_subdomain}.sc-market.space`,
      }
    : undefined
  return (
    <NotificationBase icon={<StorefrontRoundedIcon />} to={to} notif={notif}>
      {accepted
        ? values
          ? t("notifications.storefront_enquiry.accepted", {
              ...values,
              defaultValue:
                "Your branded storefront enquiry for {{name}} ({{subdomain}}) was accepted",
            })
          : t(
              "notifications.storefront_enquiry.acceptedGeneric",
              "Your branded storefront enquiry was accepted",
            )
        : values
          ? t("notifications.storefront_enquiry.declined", {
              ...values,
              defaultValue:
                "Your branded storefront enquiry for {{name}} ({{subdomain}}) was declined",
            })
          : t(
              "notifications.storefront_enquiry.declinedGeneric",
              "Your branded storefront enquiry was declined",
            )}
    </NotificationBase>
  )
}
