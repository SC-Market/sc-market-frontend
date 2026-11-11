/**
 * Admin endpoint adjustments on top of the generated v2 client (market.ts).
 *
 * - No retries for admin actions that send or change things on the server
 *   (an alert to every user, a test notification, the Spectrum migration):
 *   a 5xx after the work started must not run it again. Use these hooks
 *   instead of the ones in market.ts.
 * - importGameData: the zip upload is multipart, which the generated
 *   endpoint can't express (its arg is void), so it is overridden here like
 *   the photo uploads in market-overrides.ts. The response type is the
 *   generated one.
 */
import { marketV2Api, type ImportGameDataApiResponse } from "./market"

const NO_RETRY = { extraOptions: { maxRetries: 0 } }

const adminNoRetry = marketV2Api.enhanceEndpoints({
  endpoints: {
    createAdminAlert: NO_RETRY,
    postAdminTestNotification: NO_RETRY,
    runSpectrumMigration: NO_RETRY,
    rollbackSpectrumMigration: NO_RETRY,
  },
})

export const {
  useCreateAdminAlertMutation,
  usePostAdminTestNotificationMutation,
} = adminNoRetry

export interface ImportGameDataUpload {
  file: File
  gameChannel: "LIVE" | "PTU" | "EPTU"
  gameVersion?: string
}

const adminUploads = marketV2Api.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    importGameData: build.mutation<
      ImportGameDataApiResponse,
      ImportGameDataUpload
    >({
      query: ({ file, gameChannel, gameVersion }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("gameChannel", gameChannel)
        if (gameVersion) formData.append("gameVersion", gameVersion)
        return {
          url: `/admin/import-game-data`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: ["Admin"],
      extraOptions: { maxRetries: 0 },
    }),
  }),
})

export const { useImportGameDataMutation } = adminUploads
