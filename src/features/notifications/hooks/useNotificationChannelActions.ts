/**
 * Where notifications are sent, for you or for an org (`org` with its
 * spectrum ID): add and delete webhooks, and use the official Discord bot.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import { DISCORD_INVITE } from "../../../util/constants"
import {
  useProfileCreateWebhook,
  useProfileDeleteWebhook,
  useProfileUseOfficialDiscordSettingsMutation,
} from "../../profile/api/profileApi"
import {
  useCreateContractorWebhookMutation,
  useDeleteContractorWebhookMutation,
  useUseOfficialDiscordSettingsMutation,
} from "../../contractor/api/contractorApi"

/** Add a webhook for the given actions. Alerts the outcome. */
export function useCreateWebhook(org: boolean, contractorId?: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createUserWebhook] = useProfileCreateWebhook()
  const [createContractorWebhook] = useCreateContractorWebhookMutation()

  return useCallback(
    async (name: string, url: string, actions: string[]) => {
      const response = org
        ? createContractorWebhook({
            contractor: contractorId!,
            body: { name, webhook_url: url, actions },
          })
        : createUserWebhook({ name, webhook_url: url, actions })

      try {
        await response.unwrap()
        issueAlert({
          message: t("AddNotificationWebhook.submitted"),
          severity: "success",
        })
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
      }
    },
    [
      org,
      contractorId,
      createContractorWebhook,
      createUserWebhook,
      issueAlert,
      t,
    ],
  )
}

/** Delete a webhook. Alerts the outcome (with the API's reason). */
export function useDeleteWebhook(org: boolean, contractorId?: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [deleteUserWebhook] = useProfileDeleteWebhook()
  const [deleteContractorWebhook] = useDeleteContractorWebhookMutation()

  return useCallback(
    async (webhookId: string) => {
      const res = org
        ? await deleteContractorWebhook({
            contractor: contractorId!,
            webhook_id: webhookId,
          })
        : await deleteUserWebhook({ webhook_id: webhookId })

      if ("data" in res && !("error" in res)) {
        issueAlert({
          message: t("Webhooks.submitted"),
          severity: "success",
        })
      } else {
        let reason = String(res?.error || "")
        if (res?.error && "data" in res.error && res.error.data) {
          const errData = res.error.data as { error?: string; message?: string }
          reason = errData.error || errData.message || reason
        } else if (res?.error && "message" in res.error) {
          reason = res.error.message ?? reason
        }
        issueAlert({
          message: t("Webhooks.failedToSubmit") + reason,
          severity: "error",
        })
      }
    },
    [
      org,
      contractorId,
      deleteContractorWebhook,
      deleteUserWebhook,
      issueAlert,
      t,
    ],
  )
}

/**
 * Send order notifications through the official SC Market Discord bot, and
 * open the bot's invite.
 */
export function useOfficialDiscordBot(org: boolean, contractorId?: string) {
  const [setUseUserOfficial] = useProfileUseOfficialDiscordSettingsMutation()
  const [setUseContractorOfficial] = useUseOfficialDiscordSettingsMutation()

  return useCallback(async () => {
    if (org && contractorId) {
      setUseContractorOfficial(contractorId)
    } else {
      setUseUserOfficial()
    }
    window.open(DISCORD_INVITE, "_blank")
  }, [contractorId, org, setUseContractorOfficial, setUseUserOfficial])
}
