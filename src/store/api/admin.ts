/**
 * Admin API store — manual endpoints that can't be codegen'd.
 *
 * Import job endpoints (startImport, getJobStatus, listJobs) are generated
 * in store/api/v2/market.ts. Import them from there.
 *
 * This file contains:
 * - importGameData: file upload (FormData) that codegen can't express
 * - getGameDataImportJob: poll job status
 */
import { generatedApi as api } from "../generatedApi"

export interface GameDataImportJob {
  id: string
  status: "validating" | "extracting" | "importing" | "completed" | "failed"
  startedAt: string
  completedAt: string | null
  progress: string | null
  result: {
    success: boolean
    summary: Record<string, number>
    errors: string[]
    timestamp: string
  } | null
  error: string | null
  details: string | null
}

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    importGameData: build.mutation<
      { job_id: string },
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
    getGameDataImportJob: build.query<
      { job: GameDataImportJob | null },
      string
    >({
      query: (jobId) => `/api/v2/admin/import-game-data/${jobId}`,
    }),
  }),
  overrideExisting: true,
})

export { injectedRtkApi as adminApi }
export const {
  useImportGameDataMutation,
  useGetGameDataImportJobQuery,
} = injectedRtkApi
