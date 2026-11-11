import type { AdminAuditLogEntry } from "../../store/api/v2/market"
import { HeadCell } from "../../components/table/PaginatedTable"
import { type Formatters } from "../../util/format"

// Date formatting helper
export function formatDate(dateString: string, fmt: Formatters): string {
  return fmt.dateTime(dateString, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatAction(action: string): string {
  // Format action strings like "org.archived" to "Org Archived"
  // Also handle underscores like "member.role_assigned" to "Member Role Assigned"
  return action
    .split(".")
    .map((word) =>
      word
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    )
    .join(" ")
}

export function getActionColor(
  action: string,
): "default" | "primary" | "error" | "info" | "success" | "warning" {
  if (action.includes("archive") || action.includes("delete")) {
    return "error"
  }
  if (action.includes("create") || action.includes("add")) {
    return "success"
  }
  if (action.includes("update") || action.includes("modify")) {
    return "warning"
  }
  return "default"
}

// List of known audit log actions
export const AUDIT_LOG_ACTIONS = [
  "org.created",
  "org.updated",
  "org.archived",
  "member.added",
  "member.removed",
  "member.role_assigned",
  "member.role_removed",
  "role.created",
  "role.updated",
  "role.deleted",
  "invite.created",
  "invite.deleted",
  "invite.accepted",
  "order.cancelled",
  "offer.rejected",
  "settings.updated",
  "discord.linked",
] as const

export const headCells: readonly HeadCell<
  AdminAuditLogEntry & { expanded?: boolean }
>[] = [
  {
    id: "expanded",
    numeric: false,
    disablePadding: true,
    label: "",
    noSort: true,
  },
  {
    id: "action",
    numeric: false,
    disablePadding: true,
    label: "adminAuditLogs.action",
    noSort: true,
  },
  {
    id: "actor",
    numeric: false,
    disablePadding: false,
    label: "adminAuditLogs.actor",
    noSort: true,
  },
  {
    id: "contractor",
    numeric: false,
    disablePadding: false,
    label: "adminAuditLogs.contractor",
    noSort: true,
  },
  {
    id: "subject_type",
    numeric: false,
    disablePadding: false,
    label: "adminAuditLogs.subject",
    noSort: true,
  },
  {
    id: "created_at",
    numeric: false,
    disablePadding: false,
    label: "adminAuditLogs.timestamp",
    noSort: false,
  },
]
