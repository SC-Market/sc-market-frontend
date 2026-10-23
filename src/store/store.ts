import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { serviceApi } from "./service"
import { generatedApi } from "./generatedApi"
import { generatedApiV2 } from "./generatedApiV2"
import { v2CacheInvalidationMiddleware } from "./v2CacheInvalidation"
import type { NetworkEnv, StoreExtra } from "./networkEnv"
// import {wikiActionApi, wikiRestApi} from "./wiki";

const rootReducer = combineReducers({
  [serviceApi.reducerPath]: serviceApi.reducer,
  [generatedApi.reducerPath]: generatedApi.reducer,
  [generatedApiV2.reducerPath]: generatedApiV2.reducer,
  // [wikiRestApi.reducerPath]: wikiRestApi.reducer,
  // [wikiActionApi.reducerPath]: wikiActionApi.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

/**
 * Create a store. The browser creates exactly one (src/index.tsx); a server
 * render would create one per request with its own NetworkEnv.
 *
 * Side effects that only make sense in a browser (setupListeners, seeding the
 * profile cache from localStorage) belong to the caller, not here.
 */
export function makeStore({
  networkEnv,
  preloadedState,
}: {
  networkEnv: NetworkEnv
  preloadedState?: Partial<RootState>
}) {
  const extra: StoreExtra = { networkEnv }
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (gDM) =>
      gDM({ thunk: { extraArgument: extra } }).concat(
        serviceApi.middleware,
        generatedApi.middleware,
        generatedApiV2.middleware,
        v2CacheInvalidationMiddleware,
      ),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore["dispatch"]
