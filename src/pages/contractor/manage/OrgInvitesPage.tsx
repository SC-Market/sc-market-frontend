import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { OrgInvite } from "../../../views/contractor/OrgInvite"
import { CreateOrgInviteCode } from "../../../views/contractor/CreateOrgInviteCode"
import { ListInviteCodes } from "../../../views/contractor/ListInviteCodes"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function OrgInvitesPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <OrgInvite />
      <CreateOrgInviteCode />
      <ListInviteCodes />
    </Grid>
  )
}
