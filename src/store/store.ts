import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { serviceApi } from "./service"
import { generatedApi } from "./generatedApi"
// Import tokensApi to ensure it's registered (it uses injectEndpoints on serviceApi)
import "../features/api-tokens"
// Import generated API slices so they inject into generatedApi
import "./api"
// import {wikiActionApi, wikiRestApi} from "./wiki";

export const store = configureStore({
  reducer: {
    [serviceApi.reducerPath]: serviceApi.reducer,
    [generatedApi.reducerPath]: generatedApi.reducer,
    // tokensApi is now injected into serviceApi, so no separate reducer needed
    // [wikiRestApi.reducerPath]: wikiRestApi.reducer,
    // [wikiActionApi.reducerPath]: wikiActionApi.reducer,
  },

  middleware: (gDM) =>
    gDM().concat(
      serviceApi.middleware,
      generatedApi.middleware,
      // tokensApi middleware is included in serviceApi middleware
      // wikiRestApi.middleware,
      // wikiActionApi.middleware,
    ),
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
