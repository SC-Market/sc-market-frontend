// ── Status display constants ──

export const statusColors = new Map<
  | "active"
  | "inactive"
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled",
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
>([
  ["fulfilled", "success"],
  ["in-progress", "info"],
  ["cancelled", "warning"],
  ["not-started", "error"],
  ["active", "success"],
  ["inactive", "warning"],
])

export const statusNames = new Map<
  | "active"
  | "inactive"
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled",
  string
>([
  ["fulfilled", "orders.status.fulfilled"],
  ["in-progress", "orders.status.inProgress"],
  ["cancelled", "orders.status.cancelled"],
  ["not-started", "orders.status.notStarted"],
  ["active", "orders.status.active"],
  ["inactive", "orders.status.inactive"],
])

// ── Payment type constants ──
// Note: The full PAYMENT_TYPES with translation keys lives in util/constants.ts
// This is the raw type union — see domain/types.ts PaymentType
