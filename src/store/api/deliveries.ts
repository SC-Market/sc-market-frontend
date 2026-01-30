import { serviceApi as api } from "../service"
export const addTagTypes = [] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({}),
    overrideExisting: false,
  })
export { injectedRtkApi as deliveriesApi }
export const {} = injectedRtkApi
