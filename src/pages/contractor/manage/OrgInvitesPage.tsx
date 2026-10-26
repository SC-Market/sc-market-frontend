import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { OrgInvite } from "../../../views/contractor/OrgInvite"
import { CreateOrgInviteCode } from "../../../views/contractor/CreateOrgInviteCode"
import { ListInviteCodes } from "../../../views/contractor/ListInviteCodes"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { HelpLink } from "../../../features/help/components/HelpLink"

export function OrgInvitesPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12}>
        <HelpLink guide="orgInvites" />
      </Grid>
      <OrgInvite />
      <CreateOrgInviteCode />
      <ListInviteCodes />
    </Grid>
  )
}
