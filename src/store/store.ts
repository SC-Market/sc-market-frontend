import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { serviceApi } from "./service"
import { generatedApi } from "./generatedApi"
import { generatedApiV2 } from "./generatedApiV2"
import { wikiApi } from "./wikiApi"
import { craftingApi } from "./craftingApi"
import { versionsApi } from "./versionsApi"
import { missionsApi } from "./missionsApi"
import { blueprintsApi } from "./blueprintsApi"
import { resourcesApi } from "./resourcesApi"
import { wishlistsApi } from "./wishlistsApi"
// import {wikiActionApi, wikiRestApi} from "./wiki";

export const store = configureStore({
  reducer: {
    [serviceApi.reducerPath]: serviceApi.reducer,
    [generatedApi.reducerPath]: generatedApi.reducer,
    [generatedApiV2.reducerPath]: generatedApiV2.reducer,
    [wikiApi.reducerPath]: wikiApi.reducer,
    [craftingApi.reducerPath]: craftingApi.reducer,
    [versionsApi.reducerPath]: versionsApi.reducer,
    [missionsApi.reducerPath]: missionsApi.reducer,
    [blueprintsApi.reducerPath]: blueprintsApi.reducer,
    [resourcesApi.reducerPath]: resourcesApi.reducer,
    [wishlistsApi.reducerPath]: wishlistsApi.reducer,
    // [wikiRestApi.reducerPath]: wikiRestApi.reducer,
    // [wikiActionApi.reducerPath]: wikiActionApi.reducer,
  },

  middleware: (gDM) =>
    gDM().concat(
      serviceApi.middleware,
      generatedApi.middleware,
      generatedApiV2.middleware,
      wikiApi.middleware,
      craftingApi.middleware,
      versionsApi.middleware,
      missionsApi.middleware,
      blueprintsApi.middleware,
      resourcesApi.middleware,
      wishlistsApi.middleware,
      // wikiRestApi.middleware,
      // wikiActionApi.middleware,
    ),
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
