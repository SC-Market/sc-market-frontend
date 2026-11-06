/** Personal API tokens: create, edit and delete. */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useCreateTokenMutation,
  useDeleteTokenMutation,
  useUpdateTokenMutation,
} from "../api/tokensApi"
import type { CreateTokenRequest, UpdateTokenRequest } from "../domain/types"

/**
 * Create a token. Resolves to the new token's secret (shown once), or the
 * message to show when it failed.
 */
export function useCreateToken() {
  const { t } = useTranslation()
  const [createToken, { isLoading }] = useCreateTokenMutation()

  const create = useCallback(
    async (
      request: CreateTokenRequest,
    ): Promise<{ token: string } | { error: string }> => {
      try {
        const result = await createToken(request).unwrap()
        return { token: result.token }
      } catch (err) {
        const error = err as {
          data?: { error?: { message?: string } | string }
        }
        const errorMsg =
          typeof error.data?.error === "string"
            ? error.data.error
            : error.data?.error?.message
        return { error: errorMsg || t("apiTokensUi.create.error") }
      }
    },
    [createToken, t],
  )

  return { create, isLoading }
}

/**
 * Save a token's edits and alert. Resolves to null when saved, else the
 * message to show.
 */
export function useUpdateToken() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateToken, { isLoading }] = useUpdateTokenMutation()

  const update = useCallback(
    async (
      tokenId: string,
      body: UpdateTokenRequest,
    ): Promise<string | null> => {
      try {
        await updateToken({ tokenId, body }).unwrap()
        issueAlert({
          message: t("apiTokensUi.edit.success"),
          severity: "success",
        })
        return null
      } catch (err) {
        const error = err as { data?: { error?: string } }
        return error.data?.error || t("apiTokensUi.edit.error")
      }
    },
    [updateToken, issueAlert, t],
  )

  return { update, isLoading }
}

/** Delete a token. Resolves to whether it was deleted. */
export function useDeleteToken() {
  const [deleteToken] = useDeleteTokenMutation()
  return useCallback(
    async (tokenId: string): Promise<boolean> => {
      try {
        await deleteToken(tokenId).unwrap()
        return true
      } catch {
        // Error handled by RTK Query
        return false
      }
    },
    [deleteToken],
  )
}
