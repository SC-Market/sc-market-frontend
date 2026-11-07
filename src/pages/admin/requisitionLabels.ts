export const STATUS_COLORS: Record<
  string,
  "default" | "warning" | "info" | "success" | "error"
> = {
  "not-started": "warning",
  "in-progress": "info",
  fulfilled: "success",
  cancelled: "error",
}

export const STATUS_LABEL_KEYS: Record<string, string> = {
  "not-started": "suppliersUi.requisitions.statusChip.notStarted",
  "in-progress": "suppliersUi.requisitions.statusChip.inProgress",
  fulfilled: "suppliersUi.requisitions.statusChip.fulfilled",
  cancelled: "suppliersUi.requisitions.statusChip.cancelled",
}
