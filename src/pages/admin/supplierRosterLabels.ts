export const TIER_COLORS: Record<
  string,
  "success" | "primary" | "warning" | "default"
> = {
  preferred: "success",
  approved: "primary",
  restricted: "warning",
}

export const TIER_LABEL_KEYS: Record<string, string> = {
  preferred: "suppliersUi.tiers.preferred",
  approved: "suppliersUi.tiers.approved",
  restricted: "suppliersUi.tiers.restricted",
}

export const STATUS_LABEL_KEYS: Record<string, string> = {
  active: "suppliersUi.roster.statusChip.active",
  suspended: "suppliersUi.roster.statusChip.suspended",
  removed: "suppliersUi.roster.statusChip.removed",
}

export const STATUS_COLORS: Record<string, "success" | "default" | "error"> = {
  active: "success",
  suspended: "default",
  removed: "error",
}
