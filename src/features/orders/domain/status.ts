/**
 * Order statuses: which ones are closed. Pure: no React, no store.
 * The backend locks a closed order (only a site admin may still change it).
 */

/** Statuses after which an order is finished and locked. */
export const ORDER_CLOSED_STATUSES = ["cancelled", "fulfilled"] as const

/** Whether the order is still running (neither cancelled nor fulfilled). */
export function isOrderOpen(status: string): boolean {
  return !(ORDER_CLOSED_STATUSES as readonly string[]).includes(status)
}
