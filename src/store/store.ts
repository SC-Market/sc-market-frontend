import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { serviceApi } from "./service"
import { generatedApi } from "./generatedApi"
import { generatedApiV2 } from "./generatedApiV2"
import { v2CacheInvalidationMiddleware } from "./v2CacheInvalidation"
import { loadProfileCache } from "../features/profile/profileCache"
import { userApi } from "../features/profile/api/profileApi"
// import {wikiActionApi, wikiRestApi} from "./wiki";

export const store = configureStore({
  reducer: {
    [serviceApi.reducerPath]: serviceApi.reducer,
    [generatedApi.reducerPath]: generatedApi.reducer,
    [generatedApiV2.reducerPath]: generatedApiV2.reducer,
    // [wikiRestApi.reducerPath]: wikiRestApi.reducer,
    // [wikiActionApi.reducerPath]: wikiActionApi.reducer,
  },

  middleware: (gDM) =>
    gDM().concat(
      serviceApi.middleware,
      generatedApi.middleware,
      generatedApiV2.middleware,
      v2CacheInvalidationMiddleware,
    ),
})

setupListeners(store.dispatch)

// Seed profile cache from localStorage (prevents logged-out flash),
// then invalidate so the next subscription triggers a network fetch.
const cachedProfile = loadProfileCache()
if (cachedProfile) {
  store.dispatch(
    userApi.util.upsertQueryData("profileGetUserProfile", undefined, cachedProfile),
  )
  // Mark stale so useGetUserProfileQuery refetches on mount
  setTimeout(() => {
    store.dispatch(userApi.util.invalidateTags(["MyProfile"]))
  }, 0)
}

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
