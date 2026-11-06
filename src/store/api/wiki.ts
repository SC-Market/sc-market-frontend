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
export { injectedRtkApi as wikiApi }
export const {} = injectedRtkApi
