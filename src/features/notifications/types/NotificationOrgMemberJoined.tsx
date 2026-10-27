import { useMemo } from "react"
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded"
import { useTranslation } from "react-i18next"
import { Notification } from "../../../hooks/login/UserProfile"
import { NotificationBase } from "../components/NotificationBase"
import { ORG_PATHS } from "../../../routes/paths"

/** Someone joined an org you manage invites for (entity: the org; actor: the new member). */
export function NotificationOrgMemberJoined(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()
  const org = useMemo(
    () => notif.entity as unknown as { spectrum_id: string; name: string },
    [notif.entity],
  )
  const member = notif.actors?.[0]
  const who =
    member?.display_name ||
    member?.username ||
    t("notifications.someone", "Someone")
  return (
    <NotificationBase
      icon={<GroupAddRoundedIcon />}
      to={ORG_PATHS.profileTab(org.spectrum_id, "members")}
      notif={notif}
    >
      {t("notifications.org_member_joined", {
        defaultValue: "{{who}} joined {{org}}",
        who,
        org: org.name,
      })}
    </NotificationBase>
  )
}
