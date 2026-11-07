import React from "react"
import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material"
import type { TFunction } from "i18next"
import { formatNumber } from "../../util/format"
import { amber, blue, cyan, deepPurple, red, teal } from "@mui/material/colors"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** An aUEC amount, abbreviated from 1,000 up in the locale's short form ("15K", "1.5M"). */
export function formatAuec(value: number, locale: string): string {
  return formatNumber(value, locale, {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  })
}

export function timeAgo(t: TFunction, isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60)
    return t("suppliersUi.dashboard.timeAgo.minutes", { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24)
    return t("suppliersUi.dashboard.timeAgo.hours", { count: hours })
  return t("suppliersUi.dashboard.timeAgo.days", {
    count: Math.floor(hours / 24),
  })
}

export function initials(name: string): string {
  return name
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

export function avatarColor(name: string): string {
  const colors = [
    blue[500],
    deepPurple[300],
    cyan[500],
    teal[400],
    amber[700],
    red[500],
  ]
  let h = 0
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffffff
  return colors[Math.abs(h) % colors.length]
}

export const VISIBILITY_CHIP: Record<
  string,
  { label: string; color: "primary" | "info" | "default" }
> = {
  private: {
    label: "suppliersUi.dashboard.visibility.targeted",
    color: "primary",
  },
  roster_only: {
    label: "suppliersUi.dashboard.visibility.roster",
    color: "info",
  },
  public: {
    label: "suppliersUi.dashboard.visibility.public",
    color: "default",
  },
}

export const ORDER_STATUS_CHIP: Record<
  string,
  { label: string; color: "warning" | "success" | "error" | "default" }
> = {
  "not-started": {
    label: "suppliersUi.dashboard.orderStatus.notStarted",
    color: "warning",
  },
  "in-progress": {
    label: "suppliersUi.dashboard.orderStatus.inProgress",
    color: "warning",
  },
  fulfilled: {
    label: "suppliersUi.dashboard.orderStatus.fulfilled",
    color: "success",
  },
  cancelled: {
    label: "suppliersUi.dashboard.orderStatus.cancelled",
    color: "error",
  },
}

export const REQ_STATUS_CHIP: Record<
  string,
  {
    label: string
    color: "warning" | "primary" | "success" | "error" | "default"
  }
> = {
  "not-started": {
    label: "suppliersUi.dashboard.reqStatus.awaiting",
    color: "warning",
  },
  "in-progress": {
    label: "suppliersUi.dashboard.reqStatus.inProgress",
    color: "primary",
  },
  fulfilled: {
    label: "suppliersUi.dashboard.reqStatus.fulfilled",
    color: "success",
  },
  cancelled: {
    label: "suppliersUi.dashboard.reqStatus.cancelled",
    color: "error",
  },
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  loading?: boolean
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
  loading,
}: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: accent ? "primary.main" : "divider",
        bgcolor: accent ? "rgba(59,130,246,0.06)" : "background.paper",
        flex: 1,
        minWidth: 140,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
        <Box
          sx={{
            color: accent ? "primary.main" : "text.secondary",
            display: "flex",
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Stack>
      {loading ? (
        <Skeleton width={60} height={28} />
      ) : (
        <Typography
          variant="h6"
          fontWeight={700}
          fontFamily="'Space Grotesk', sans-serif"
          lineHeight={1.1}
        >
          {value}
        </Typography>
      )}
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Paper>
  )
}
