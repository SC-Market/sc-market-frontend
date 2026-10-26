import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ManageRoles, AddRole } from "../../../views/contractor/OrgRoles"
import { ManageMemberList } from "../../../views/contractor/OrgMembers"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { HelpLink } from "../../../features/help/components/HelpLink"

export function OrgRolesPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12}>
        <HelpLink guide="orgRoles" />
      </Grid>
      <ManageRoles />
      <ManageMemberList />
      <AddRole />
    </Grid>
  )
}
