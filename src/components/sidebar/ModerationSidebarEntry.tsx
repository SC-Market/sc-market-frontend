import React from "react"
import { Badge, IconButton } from "@mui/material"
import { SecurityRounded } from "@mui/icons-material"
import { useGetAdminReportsQuery } from "../../features/admin/api/moderationApi"

interface ModerationSidebarEntryProps {
  text: string
  to: string
}

export function ModerationSidebarEntry({
  text,
  to,
}: ModerationSidebarEntryProps) {
  const { data: reportsData } = useGetAdminReportsQuery({
    page: 1,
    page_size: 1,
    status: "pending",
  })

  const pendingCount = reportsData?.pagination?.total_reports || 0

  return (
    <Badge badgeContent={pendingCount} color="error" max={99}>
      <SecurityRounded />
    </Badge>
  )
}
