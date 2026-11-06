import { generatedApi as api } from "../generatedApi"
export const addTagTypes = [] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: () => ({}),
    overrideExisting: false,
  })
export { injectedRtkApi as deliveriesApi }
export const {} = injectedRtkApi
