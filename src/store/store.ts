import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { serviceApi } from "./service"
import { tokensApi } from "./tokens"
// import {wikiActionApi, wikiRestApi} from "./wiki";

export const store = configureStore({
  reducer: {
    [serviceApi.reducerPath]: serviceApi.reducer,
    [tokensApi.reducerPath]: tokensApi.reducer,
    // [wikiRestApi.reducerPath]: wikiRestApi.reducer,
    // [wikiActionApi.reducerPath]: wikiActionApi.reducer,
  },

  middleware: (gDM) =>
    gDM().concat(
      serviceApi.middleware,
      tokensApi.middleware,
      // wikiRestApi.middleware,
      // wikiActionApi.middleware,
    ),
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
