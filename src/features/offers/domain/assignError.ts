/**
 * The reason an assign / unassign request failed, for the alert after
 * "Failed to assign". From the API body's `error` or `message`, else the
 * error's own message.
 */
export function assignErrorReason(error: unknown): string {
  if (!error) return ""
  if (typeof error === "object" && "data" in error && error.data) {
    const data = error.data as { error?: string; message?: string }
    if (data.error || data.message)
      return (data.error || data.message) as string
  } else if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: string }).message
    if (message) return message
  }
  return String(error)
}
