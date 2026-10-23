import { useDispatch } from "react-redux"
import type { AppDispatch } from "./store"

/** Typed dispatch hook. Use this instead of importing a store instance. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
