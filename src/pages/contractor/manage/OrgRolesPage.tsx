import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ManageRoles, AddRole } from "../../../views/contractor/OrgRoles"
import { ManageMemberList } from "../../../views/contractor/OrgMembers"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { HelpLink } from "../../../features/help/components/HelpLink"
import { FirstUseHint } from "../../../features/help/components/FirstUseHint"
import { useTranslation } from "react-i18next"

export function OrgRolesPage() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12}>
        <HelpLink guide="orgRoles" />
      </Grid>
      <Grid item xs={12} sx={{ "&:empty": { display: "none" } }}>
        <FirstUseHint
          hint="shopPermissions"
          title={t("hints.shopPermissions.title")}
        >
          {t("hints.shopPermissions.body")}
        </FirstUseHint>
      </Grid>
      <ManageRoles />
      <ManageMemberList />
      <AddRole />
    </Grid>
  )
}
