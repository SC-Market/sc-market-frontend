import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Notification } from "../../../hooks/login/UserProfile"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { NotificationBase } from "../components/NotificationBase"
import type { PublicContract } from "../../contracting/domain/types"

/** "New public contract" alert (opt-in, Settings -> Notifications). */
export function NotificationPublicContract(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const contract =
    notif.entity && "kind" in notif.entity && "id" in notif.entity
      ? (notif.entity as PublicContract)
      : undefined
  const to = `/contracts/public/${contract?.id ?? ""}`

  return (
    <NotificationBase icon={<AssignmentRoundedIcon />} to={to} notif={notif}>
      {t("notifications.public_contract", "New public contract:")}{" "}
      <Link
        to={to}
        style={{ textDecoration: "none", color: theme.palette.secondary.main }}
      >
        <UnderlineLink>{contract?.title || "..."}</UnderlineLink>
      </Link>
      {contract?.kind
        ? ` (${t(`orderKinds.${contract.kind}`, contract.kind)})`
        : ""}
    </NotificationBase>
  )
}
