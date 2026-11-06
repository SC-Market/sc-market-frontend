/**
 * Admin identity tools: release a username, unlink Discord, fix the Spectrum
 * link, deactivate or reactivate an account. One mutation per action; the
 * dialog shows the state of the one it has open.
 */
import { useCallback } from "react"
import {
  useDeactivateIdentityUserMutation,
  useFixIdentitySpectrumMutation,
  useReactivateIdentityUserMutation,
  useReleaseIdentityUsernameMutation,
  useUnlinkIdentityDiscordMutation,
  type IdentityActionKind,
} from "../../../store/api/v2/market"

export type IdentityActionId =
  | "release"
  | "unlinkDiscord"
  | "spectrum"
  | "deactivate"
  | "reactivate"

export interface IdentityActionInput {
  /** Already trimmed. */
  reason: string
  /** unlinkDiscord: leave the account with no login method. */
  allowNoLogin: boolean
  /** spectrum: clear the link, or set it to this (trimmed) id. */
  spectrum: { mode: "clear" } | { mode: "set"; spectrumUserId: string }
}

export function useIdentityAction(action: IdentityActionId | null) {
  const [release, releaseState] = useReleaseIdentityUsernameMutation()
  const [unlink, unlinkState] = useUnlinkIdentityDiscordMutation()
  const [spectrum, spectrumState] = useFixIdentitySpectrumMutation()
  const [deactivate, deactivateState] = useDeactivateIdentityUserMutation()
  const [reactivate, reactivateState] = useReactivateIdentityUserMutation()

  const states = {
    release: releaseState,
    unlinkDiscord: unlinkState,
    spectrum: spectrumState,
    deactivate: deactivateState,
    reactivate: reactivateState,
  }
  const state = action ? states[action] : null

  /** Run the open action; resolves to what it did, or null if it failed. */
  const run = useCallback(
    async (
      userId: string,
      input: IdentityActionInput,
    ): Promise<IdentityActionKind | null> => {
      if (!action) return null
      const body = { reason: input.reason }
      const result =
        action === "release"
          ? await release({ userId, identityActionRequest: body })
          : action === "unlinkDiscord"
            ? await unlink({
                userId,
                unlinkDiscordRequest: {
                  ...body,
                  allow_no_login: input.allowNoLogin,
                },
              })
            : action === "spectrum"
              ? await spectrum({
                  userId,
                  spectrumFixRequest:
                    input.spectrum.mode === "set"
                      ? {
                          ...body,
                          mode: "set",
                          spectrum_user_id: input.spectrum.spectrumUserId,
                        }
                      : { ...body, mode: "clear" },
                })
              : action === "deactivate"
                ? await deactivate({ userId, identityActionRequest: body })
                : await reactivate({ userId, identityActionRequest: body })
      return "data" in result && result.data ? result.data.kind : null
    },
    [action, release, unlink, spectrum, deactivate, reactivate],
  )

  const { reset: resetRelease } = releaseState
  const { reset: resetUnlink } = unlinkState
  const { reset: resetSpectrum } = spectrumState
  const { reset: resetDeactivate } = deactivateState
  const { reset: resetReactivate } = reactivateState
  /** Clear every action's result and error. */
  const reset = useCallback(() => {
    resetRelease()
    resetUnlink()
    resetSpectrum()
    resetDeactivate()
    resetReactivate()
  }, [
    resetRelease,
    resetUnlink,
    resetSpectrum,
    resetDeactivate,
    resetReactivate,
  ])

  return {
    run,
    isLoading: state?.isLoading ?? false,
    error: state?.error,
    reset,
  }
}
