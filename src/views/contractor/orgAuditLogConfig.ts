import { AuditLogEntry } from "../../features/contractor/domain/types"
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
  "shop.transferred",
] as const

/**
 * i18n key of an action's label. Keys are flat ("orgAuditLogs.action_org_created"):
 * "orgAuditLogs.action" is itself the column header string, so it can't also
 * be a namespace (the old "orgAuditLogs.action.org_created" never resolved).
 */
export function auditActionKey(action: string): string {
  return `orgAuditLogs.action_${action.replace(/\./g, "_")}`
}

export const headCells: readonly HeadCell<
  AuditLogEntry & { expanded?: boolean }
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
    label: "orgAuditLogs.action",
    noSort: true,
  },
  {
    id: "actor",
    numeric: false,
    disablePadding: false,
    label: "orgAuditLogs.actor",
    noSort: true,
  },
  {
    id: "created_at",
    numeric: false,
    disablePadding: false,
    label: "orgAuditLogs.timestamp",
    noSort: false,
  },
]
