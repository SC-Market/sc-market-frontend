import { generatedApi as api } from "../generatedApi"
export const addTagTypes = [] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({}),
    overrideExisting: false,
  })
export { injectedRtkApi as adminApi }
export const {} = injectedRtkApi
