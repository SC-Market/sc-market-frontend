import { BACKEND_URL } from "../../../util/constants"
import { Ship } from "../../../datatypes/Ship"
import { serviceApi } from "../../../store/service"

export interface SerializedError {
  error?: string
}

export interface ShipsFileEntry {
  name: string
  manufacturer_code: string
  manufacturer_name: string
  ship_code: string
  ship_name: string
  ship_series: string
  pledge_id: string
  pledge_name: string
  pledge_date: string
  pledge_cost: string
  lti: boolean
  warbond: boolean
}

export const ShipsFileSchema = [
  {
    name: "string",
    manufacturer_code: "string",
    manufacturer_name: "string",
    ship_code: "string",
    ship_name: "string",
    ship_series: "string",
    pledge_id: "string",
    pledge_name: "string",
    pledge_date: "string",
    pledge_cost: "string",
    lti: "boolean",
    warbond: "boolean",
  },
]

// TODO: Use mutation to upload ship JSON
const baseUrl = `${BACKEND_URL}/api/ship`
export const shipApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    shipImportFile: builder.mutation<void, ShipsFileEntry[]>({
      query: (body: ShipsFileEntry[]) => ({
        url: `${baseUrl}/import`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MyShips"],
    }),
  }),
})

const baseUrlPlural = `${BACKEND_URL}/api/ships`

export const shipsApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    shipGetMine: builder.query<Ship[], void>({
      query: () => `${baseUrlPlural}/mine`,
      providesTags: ["MyShips"],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const useGetMyShips = shipsApi.endpoints.shipGetMine.useQuery
export const useImportShipFile = shipApi.endpoints.shipImportFile.useMutation
