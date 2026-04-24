/**
 * @deprecated Import from "features/services/api/servicesApi" instead.
 */
import "../features/services/api/servicesApi"

export type {
  ServicesResponse,
  ServicesPagination,
  ServicesQueryParams,
} from "../features/services/api/servicesApi"

export {
  useGetPublicServicesQuery,
  useGetServicesContractorQuery,
  useGetServiceByIdQuery,
  useGetServicesQuery,
  useUpdateServiceMutation,
  useCreateServiceMutation,
  useUploadServicePhotosMutation,
} from "../features/services/api/servicesApi"
