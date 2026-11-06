/** Public API (/api/public/v1) tokens: create from a preset, and revoke. */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useCreatePublicApiTokenMutation,
  useRevokePublicApiTokenMutation,
  type CreatePublicApiTokenRequest,
} from "../../../store/api/v2/market"

/** The server's error message of a failed request, when it sent one. */
function serverMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return undefined
  }
  const data = error.data
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return undefined
  }
  const inner = data.error
  if (typeof inner !== "object" || inner === null || !("message" in inner)) {
    return undefined
  }
  return typeof inner.message === "string" ? inner.message : undefined
}

/**
 * Create a public API token. Resolves to its secret (shown once), or the
 * message to show when it failed.
 */
export function useCreatePublicApiToken() {
  const { t } = useTranslation()
  const [createToken, { isLoading }] = useCreatePublicApiTokenMutation()

  const create = useCallback(
    async (
      request: CreatePublicApiTokenRequest,
    ): Promise<{ token: string } | { error: string }> => {
      try {
        const result = await createToken({
          createPublicApiTokenRequest: request,
        }).unwrap()
        return { token: result.token }
      } catch (e) {
        return {
          error: serverMessage(e) ?? t("settings.publicApi.dialog.error"),
        }
      }
    },
    [createToken, t],
  )

  return { create, isLoading }
}

/** Revoke a token. Resolves to null when revoked, else the message to show. */
export function useRevokePublicApiToken() {
  const { t } = useTranslation()
  const [revokeToken, { isLoading: revoking }] =
    useRevokePublicApiTokenMutation()

  const revoke = useCallback(
    async (tokenId: string): Promise<string | null> => {
      try {
        await revokeToken({ tokenId }).unwrap()
        return null
      } catch (e) {
        return serverMessage(e) ?? t("settings.publicApi.revokeError")
      }
    },
    [revokeToken, t],
  )

  return { revoke, revoking }
}
