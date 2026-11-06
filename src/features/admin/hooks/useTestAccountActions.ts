import { useCallback } from "react"
import {
  useCreateTestAccountMutation,
  useDeleteTestAccountMutation,
  type CreateTestAccountResponse,
} from "../../../store/api/v2/market"

/**
 * Admin test accounts: create one (the response carries its TOTP secret, shown
 * once) and delete one. The page shows errors and the new secret from the
 * returned states.
 */
export function useTestAccountActions() {
  const [createMutation, createState] = useCreateTestAccountMutation()
  const [deleteMutation, removeState] = useDeleteTestAccountMutation()

  /** Resolves to the new account's credential, or null if it failed. */
  const create = useCallback(
    async (
      username: string,
      displayName: string,
    ): Promise<CreateTestAccountResponse | null> => {
      const result = await createMutation({
        createTestAccountRequest: {
          username: username.trim(),
          display_name: displayName.trim(),
        },
      })
      return "data" in result && result.data ? result.data : null
    },
    [createMutation],
  )

  const remove = useCallback(
    async (username: string) => {
      await deleteMutation({ username })
    },
    [deleteMutation],
  )

  return { create, createState, remove, removeState }
}
