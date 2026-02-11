import React from "react"
import { useGetAdminReportsQuery } from "../../store/moderation"

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import SecurityRounded from '@mui/icons-material/SecurityRounded';

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
