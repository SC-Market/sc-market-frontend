import { generatedApi as api } from "../generatedApi"

export const addTagTypes = ["ImportJobs"] as const

export type ImportSource = "cstone-items" | "uex-items" | "uex-attributes"
export type JobStatus = "running" | "completed" | "failed"

export interface ImportJob {
  id: string
  source: ImportSource
  status: JobStatus
  startedAt: string
  completedAt: string | null
  result: Record<string, any> | null
  error: string | null
}

const injectedRtkApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (build) => ({
    startImport: build.mutation<{ job: ImportJob }, ImportSource>({
      query: (source) => ({
        url: `/api/v2/admin/imports/${source}`,
        method: "POST",
      }),
      invalidatesTags: ["ImportJobs"],
    }),
    getImportJob: build.query<{ job: ImportJob | null }, string>({
      query: (jobId) => `/api/v2/admin/imports/${jobId}`,
      providesTags: ["ImportJobs"],
    }),
    listImportJobs: build.query<{ jobs: ImportJob[] }, void>({
      query: () => `/api/v2/admin/imports`,
      providesTags: ["ImportJobs"],
    }),
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

export const {
  useStartImportMutation,
  useGetImportJobQuery,
  useListImportJobsQuery,
  useImportGameDataMutation,
} = injectedRtkApi
