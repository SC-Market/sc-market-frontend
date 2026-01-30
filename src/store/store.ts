import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { serviceApi } from "./service"
// Import tokensApi to ensure it's registered (it uses injectEndpoints on serviceApi)
import "../features/api-tokens"
// import {wikiActionApi, wikiRestApi} from "./wiki";

export const store = configureStore({
  reducer: {
    [serviceApi.reducerPath]: serviceApi.reducer,
    // tokensApi is now injected into serviceApi, so no separate reducer needed
    // [wikiRestApi.reducerPath]: wikiRestApi.reducer,
    // [wikiActionApi.reducerPath]: wikiActionApi.reducer,
  },

  middleware: (gDM) =>
    gDM().concat(
      serviceApi.middleware,
      // tokensApi middleware is included in serviceApi middleware
      // wikiRestApi.middleware,
      // wikiActionApi.middleware,
    ),
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
