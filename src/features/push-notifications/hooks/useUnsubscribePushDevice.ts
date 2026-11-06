import { useCallback } from "react"
import { unsubscribeFromPush } from "../../../util/push-subscription"
import { useUnsubscribePushMutation } from "../api/pushApi"

/**
 * Remove a device's push subscription: on the server, and in this browser
 * when it is this device. Rejects when it fails.
 */
export function useUnsubscribePushDevice() {
  const [unsubscribePush] = useUnsubscribePushMutation()
  return useCallback(
    (subscriptionId: string) =>
      unsubscribeFromPush(subscriptionId, async (id) => {
        await unsubscribePush(id).unwrap()
      }),
    [unsubscribePush],
  )
}
