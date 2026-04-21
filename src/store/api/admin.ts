/**
 * Admin API store — manual endpoints that can't be codegen'd.
 *
 * Import job endpoints (startImport, getJobStatus, listJobs) are now
 * generated in store/api/v2/market.ts. Import them from there.
 *
 * This file only contains the game data import mutation which requires
 * FormData (file upload) that the codegen can't express.
 */
import { generatedApi as api } from "../generatedApi"

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    importGameData: build.mutation<
      GameDataImportResult,
      { file: File; gameChannel: string; gameVersion?: string }
    >({
      query: ({ file, gameChannel, gameVersion }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("gameChannel", gameChannel)
        if (gameVersion) formData.append("gameVersion", gameVersion)
        return {
          url: `/api/v2/admin/import-game-data`,
          method: "POST",
          body: formData,
        }
      },
    }),
  }),
  overrideExisting: true,
})

export { injectedRtkApi as adminApi }

export interface GameDataImportResult {
  success: boolean
  summary?: Record<string, number>
  errors?: string[]
  error?: string
  details?: string
  timestamp?: string
}

export const { useImportGameDataMutation } = injectedRtkApi
