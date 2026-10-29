import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"
import { PATHS } from "../../../routes/paths"

/**
 * Entity of an account_identity_changed notification (backend
 * services/identity-admin/notice-entity.ts): which change an admin made.
 * Never carries the admin's reason or name.
 */
export interface AccountIdentityNotice {
  audit_log_id: string
  kind:
    | "username_released"
    | "discord_unlinked"
    | "spectrum_cleared"
    | "spectrum_set"
    | "account_deactivated"
    | "account_reactivated"
    | "discord_link_skipped"
  new_username: string | null
  created_at: string
}

export function isAccountIdentityNotice(entity: Notification["entity"] | undefined): entity is AccountIdentityNotice {
  return !!entity && typeof entity === "object" && "audit_log_id" in entity && "kind" in entity
}

/** An admin changed your account's identity (username, Discord, RSI link, active state). */
export function NotificationAccountIdentity(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()
  const notice = isAccountIdentityNotice(notif.entity) ? notif.entity : null

  const text = (() => {
    switch (notice?.kind) {
      case "username_released":
        return t("notifications.account_identity.username_released", {
          defaultValue: "An admin released your username. Your username is now {{username}}. Use Sync handle in Settings to get your current RSI handle back.",
          username: notice.new_username ?? "",
        })
      case "discord_unlinked":
        return t("notifications.account_identity.discord_unlinked", "An admin unlinked Discord from your account. You can link a Discord account again in Settings.")
      case "spectrum_cleared":
        return t("notifications.account_identity.spectrum_cleared", "An admin removed the RSI link from your account. Verify your RSI account again in Settings.")
      case "spectrum_set":
        return t("notifications.account_identity.spectrum_set", "An admin updated the RSI link on your account.")
      case "account_deactivated":
        return t("notifications.account_identity.account_deactivated", "An admin deactivated your account.")
      case "account_reactivated":
        return t("notifications.account_identity.account_reactivated", "An admin reactivated your account.")
      case "discord_link_skipped":
        return t(
          "notifications.account_identity.discord_link_skipped",
          "Your Discord account is already linked to another SC Market account, so it wasn't linked to this one. If both accounts are yours, contact SC Market support.",
        )
      default:
        return t("notifications.account_identity.generic", "An admin changed your account.")
    }
  })()

  return (
    <NotificationBase icon={<ManageAccountsRoundedIcon />} to={PATHS.settings} notif={notif}>
      {text}
    </NotificationBase>
  )
}
