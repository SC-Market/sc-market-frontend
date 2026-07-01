import { serviceApi } from "../../../store/service"

export interface ScmdbStatusResponse {
  is_connected: boolean
  ingest_url: string | null
  last_event_at: string | null
  created_at: string | null
}

export interface ScmdbConnectResponse {
  ingest_url: string
}

export const scmdbApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getScmdbStatus: builder.query<ScmdbStatusResponse, void>({
      query: () => "/api/v2/integrations/scmdb/status",
      providesTags: ["ScmdbSync"],
    }),

    connectScmdb: builder.mutation<ScmdbConnectResponse, void>({
      query: () => ({
        url: "/api/v2/integrations/scmdb/connect",
        method: "POST",
      }),
      invalidatesTags: ["ScmdbSync"],
    }),

    regenerateScmdb: builder.mutation<ScmdbConnectResponse, void>({
      query: () => ({
        url: "/api/v2/integrations/scmdb/regenerate",
        method: "POST",
      }),
      invalidatesTags: ["ScmdbSync"],
    }),

    disconnectScmdb: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: "/api/v2/integrations/scmdb/disconnect",
        method: "DELETE",
      }),
      invalidatesTags: ["ScmdbSync"],
    }),
  }),
})

export const {
  useGetScmdbStatusQuery,
  useConnectScmdbMutation,
  useRegenerateScmdbMutation,
  useDisconnectScmdbMutation,
} = scmdbApi
