/**
 * Admin "Still selling?" DM campaign: start it, stop it, and send a test DM
 * to yourself. The card shows errors and the test sample from the states.
 */
import { useCallback } from "react"
import {
  useSendStillSellingCampaignMutation,
  useSendStillSellingTestDmMutation,
  useStopStillSellingCampaignMutation,
  type StillSellingLocale,
} from "../../../store/api/v2/market"

export function useStillSellingCampaignActions() {
  const [sendMutation, sendState] = useSendStillSellingCampaignMutation()
  const [stopMutation, stopState] = useStopStillSellingCampaignMutation()
  const [sendTestMutation, testState] = useSendStillSellingTestDmMutation()

  /** Start the campaign for the recipient count the admin confirmed. */
  const send = useCallback(
    async (expectedRecipients: number) => {
      try {
        await sendMutation({
          stillSellingSendRequest: { expected_recipients: expectedRecipients },
        }).unwrap()
      } catch {
        // Shown from sendState.error.
      }
    },
    [sendMutation],
  )

  const stop = useCallback(async () => {
    await stopMutation()
  }, [stopMutation])

  const sendTest = useCallback(
    (locale: StillSellingLocale) => {
      void sendTestMutation({ stillSellingTestRequest: { locale } })
    },
    [sendTestMutation],
  )

  return { send, sendState, stop, stopState, sendTest, testState }
}
