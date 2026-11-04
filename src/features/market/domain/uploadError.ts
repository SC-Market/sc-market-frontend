/**
 * The reason an image upload failed, from the API's error body (either
 * `{ error: { message | validationErrors } }` or the same fields at the top
 * level). Undefined when the body says nothing usable.
 */
interface UploadErrorBody {
  message?: string
  validationErrors?: { message: string }[]
}

export function uploadErrorDetail(err: unknown): string | undefined {
  const data = (err as { data?: UploadErrorBody & { error?: UploadErrorBody } })
    ?.data
  const body = data?.error || data || {}
  return body.message || body.validationErrors?.[0]?.message || undefined
}
