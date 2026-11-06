/**
 * SCMDB sync: connect, regenerate the ingest URL, disconnect. Connect and
 * regenerate resolve to the new ingest URL (it holds the secret token, so the
 * server returns it only then), or null when the request failed.
 */
import { useCallback } from "react"
import {
  useConnectScmdbMutation,
  useDisconnectScmdbMutation,
  useRegenerateScmdbMutation,
} from "../api/scmdbApi"

export function useScmdbSyncActions() {
  const [connectMutation, { isLoading: isConnecting }] =
    useConnectScmdbMutation()
  const [regenerateMutation, { isLoading: isRegenerating }] =
    useRegenerateScmdbMutation()
  const [disconnectMutation, { isLoading: isDisconnecting }] =
    useDisconnectScmdbMutation()

  const connect = useCallback(async (): Promise<string | null> => {
    const res = await connectMutation()
    return "data" in res && res.data ? res.data.ingest_url : null
  }, [connectMutation])

  const regenerate = useCallback(async (): Promise<string | null> => {
    const res = await regenerateMutation()
    return "data" in res && res.data ? res.data.ingest_url : null
  }, [regenerateMutation])

  const disconnect = useCallback(async () => {
    await disconnectMutation()
  }, [disconnectMutation])

  return {
    connect,
    regenerate,
    disconnect,
    isConnecting,
    isRegenerating,
    isDisconnecting,
  }
}
