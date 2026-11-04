/**
 * Shop Settings actions: save the profile, upload its logo / banner,
 * webhooks, order settings and transfer. Each sends the requests and alerts;
 * the forms keep their drafts.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useCreateShopWebhookMutation,
  useDeleteShopOrderSettingMutation,
  useDeleteShopWebhookMutation,
  useTransferShopMutation,
  useUpdateShopMutation,
  useUpsertShopOrderSettingMutation,
  type CreateShopWebhookRequest,
  type TransferShopRequest,
  type UpdateShopRequest,
} from "../../../store/api/v2/market"
import { useUploadImageMutation } from "../../../store/api/v2/market-overrides"
import type { OrderSettingOp } from "../domain/orderSettingsPlan"

const asAlert = (err: unknown) => err as UnwrappedErrorInterface

/** Save the shop's profile; a failure's error is returned (slug conflicts). */
export function useSaveShopSettings(shopId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateShop, { isLoading }] = useUpdateShopMutation()

  const save = useCallback(
    async (request: UpdateShopRequest): Promise<{ ok: true } | { ok: false; error: unknown }> => {
      try {
        await updateShop({ shopId, updateShopRequest: request }).unwrap()
        issueAlert({ message: t("shopsUi.settings.saved"), severity: "success" })
        return { ok: true }
      } catch (error) {
        issueAlert(asAlert(error))
        return { ok: false, error }
      }
    },
    [shopId, updateShop, issueAlert, t],
  )

  return { save, isLoading }
}

/** Upload an image: its resource id and URL, or null (the error alerts). */
export function useUploadShopImage() {
  const issueAlert = useAlertHook()
  const [uploadImage, { isLoading }] = useUploadImageMutation()

  const upload = useCallback(
    async (file: File) => {
      try {
        return await uploadImage(file).unwrap()
      } catch (err) {
        issueAlert(asAlert(err))
        return null
      }
    },
    [uploadImage, issueAlert],
  )

  return { upload, isLoading }
}

/** Add or remove a shop webhook. Each resolves to whether it worked. */
export function useShopWebhooks(shopId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createWebhook] = useCreateShopWebhookMutation()
  const [deleteWebhook] = useDeleteShopWebhookMutation()

  const create = useCallback(
    async (request: CreateShopWebhookRequest) => {
      try {
        await createWebhook({ shopId, createShopWebhookRequest: request }).unwrap()
        issueAlert({ message: t("shopsUi.webhooks.created"), severity: "success" })
        return true
      } catch (err) {
        issueAlert(asAlert(err))
        return false
      }
    },
    [shopId, createWebhook, issueAlert, t],
  )

  const remove = useCallback(
    async (webhookId: string) => {
      try {
        await deleteWebhook({ shopId, webhookId }).unwrap()
        issueAlert({ message: t("shopsUi.webhooks.deleted"), severity: "success" })
      } catch (err) {
        issueAlert(asAlert(err))
      }
    },
    [shopId, deleteWebhook, issueAlert, t],
  )

  return { create, remove }
}

/** Send the order settings' upserts and deletes (orderSettingsOps), in order. */
export function useSaveShopOrderSettings(shopId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [upsertSetting] = useUpsertShopOrderSettingMutation()
  const [deleteSetting] = useDeleteShopOrderSettingMutation()

  return useCallback(
    async (ops: OrderSettingOp[]) => {
      try {
        for (const op of ops) {
          if (op.op === "upsert") {
            await upsertSetting({
              shopId,
              settingType: op.settingType,
              upsertShopOrderSettingRequest: {
                message_content: op.message_content,
                enabled: op.enabled,
              },
            }).unwrap()
          } else {
            await deleteSetting({ shopId, settingType: op.settingType }).unwrap()
          }
        }
        issueAlert({ message: t("shopsUi.orderSettings.saved"), severity: "success" })
      } catch (err) {
        issueAlert(asAlert(err))
      }
    },
    [shopId, upsertSetting, deleteSetting, issueAlert, t],
  )
}

/** Give the shop to a user or org: the shop's slug afterwards, or null. */
export function useTransferShop(shopId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [transferShop, { isLoading }] = useTransferShopMutation()

  const transfer = useCallback(
    async (request: TransferShopRequest): Promise<string | null> => {
      try {
        const result = await transferShop({ shopId, transferShopRequest: request }).unwrap()
        issueAlert({ message: t("shopsUi.transfer.transferred"), severity: "success" })
        return result.slug
      } catch (err) {
        issueAlert(asAlert(err))
        return null
      }
    },
    [shopId, transferShop, issueAlert, t],
  )

  return { transfer, isLoading }
}
