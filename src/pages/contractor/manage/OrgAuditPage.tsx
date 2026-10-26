import { Box } from "@mui/material"
import { OrgAuditLogs } from "../../../views/contractor/OrgAuditLogs"
import { HelpLink } from "../../../features/help/components/HelpLink"

export function OrgAuditPage() {
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <HelpLink guide="orgAuditLogs" />
      </Box>
      <OrgAuditLogs />
    </>
  )
}
