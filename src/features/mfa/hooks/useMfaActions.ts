/**
 * Two-factor authentication: verifying a code, enrolling an authenticator,
 * new recovery codes and turning it off. Errors are shown from the returned
 * states (describeMfaError).
 */
import { useCallback, useRef } from "react"
import {
  useConfirmTotpEnrollmentMutation,
  useRegenerateMfaRecoveryCodesMutation,
  useRemoveMfaFactorMutation,
  useStartTotpEnrollmentMutation,
  useVerifyMfaMutation,
} from "../../../store/api/v2/market"
import { serviceApi } from "../../../store/service"
import { useAppDispatch } from "../../../store/hooks"

/** Your profile reflects the new two-factor state. */
function useRefreshProfile() {
  const dispatch = useAppDispatch()
  return useCallback(
    () => dispatch(serviceApi.util.invalidateTags(["MyProfile"])),
    [dispatch],
  )
}

/**
 * Verify a 6-digit code or a recovery code. Resolves to what was used, or
 * null when it was refused.
 */
export function useVerifyMfa() {
  const refreshProfile = useRefreshProfile()
  const [verifyMutation, { isLoading, error, reset }] = useVerifyMfaMutation()

  const verify = useCallback(
    async (
      useRecovery: boolean,
      value: string,
    ): Promise<{ usedRecoveryCode: boolean; remaining?: number } | null> => {
      const body = useRecovery
        ? { recovery_code: value.trim() }
        : { code: value }
      const result = await verifyMutation({ mfaVerifyRequest: body })
      if ("data" in result && result.data) {
        refreshProfile()
        return {
          usedRecoveryCode: result.data.method === "recovery_code",
          remaining: result.data.recovery_codes_remaining,
        }
      }
      return null
    },
    [verifyMutation, refreshProfile],
  )

  return { verify, isLoading, error, reset }
}

/**
 * Authenticator enrollment: `begin` starts one (a new secret and QR code),
 * `confirm` checks its first code, `clear` drops both results (the secret
 * and the recovery codes). `begin` and `clear` keep their identity.
 */
export function useTotpEnrollment() {
  const refreshProfile = useRefreshProfile()
  const [start, startState] = useStartTotpEnrollmentMutation()
  const [confirmMutation, confirmState] = useConfirmTotpEnrollmentMutation()
  // Read through a ref: reset() changes identity once a request is in
  // flight, and callers run begin/clear from an effect.
  const mutationsRef = useRef({ start, startState, confirmState })
  mutationsRef.current = { start, startState, confirmState }

  const clear = useCallback(() => {
    const m = mutationsRef.current
    m.startState.reset()
    m.confirmState.reset()
  }, [])

  const begin = useCallback(() => {
    mutationsRef.current.start({ totpEnrollRequest: {} })
  }, [])

  /** Resolves to whether the code was accepted. */
  const confirm = useCallback(
    async (factorId: string, code: string): Promise<boolean> => {
      const result = await confirmMutation({
        totpConfirmRequest: { factor_id: factorId, code },
      })
      if ("data" in result && result.data) {
        refreshProfile()
        return true
      }
      return false
    },
    [confirmMutation, refreshProfile],
  )

  return { begin, clear, confirm, startState, confirmState }
}

/**
 * New recovery codes. `dismiss` hides them once saved and refreshes your
 * profile.
 */
export function useRegenerateRecoveryCodes() {
  const refreshProfile = useRefreshProfile()
  const [regenerateMutation, state] = useRegenerateMfaRecoveryCodesMutation()
  const regenerate = useCallback(() => {
    regenerateMutation()
  }, [regenerateMutation])
  const { reset } = state
  const dismiss = useCallback(() => {
    reset()
    refreshProfile()
  }, [reset, refreshProfile])
  return { regenerate, dismiss, state }
}

/** Turn two-factor off with a current code. Resolves to whether it did. */
export function useRemoveMfaFactor(factorId: string) {
  const [removeMutation, state] = useRemoveMfaFactorMutation()
  const remove = useCallback(
    async (code: string): Promise<boolean> => {
      const r = await removeMutation({
        factorId,
        mfaReauthRequest: { code },
      })
      return "data" in r
    },
    [removeMutation, factorId],
  )
  return { remove, state }
}
