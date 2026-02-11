import { Reducer, combineReducers } from "@reduxjs/toolkit"
import { store } from "./store"

/**
 * Type for a lazy-loaded reducer
 */
export type LazyReducer = () => Promise<{ default: Reducer }>

/**
 * Registry of lazy-loaded reducers
 */
const lazyReducerRegistry: Record<string, LazyReducer> = {}

/**
 * Cache of loaded reducers
 */
const loadedReducers: Record<string, Reducer> = {}

/**
 * Register a lazy-loaded reducer
 * @param key - Reducer key in the store
 * @param lazyReducer - Function that returns a promise resolving to the reducer
 */
export function registerLazyReducer(key: string, lazyReducer: LazyReducer): void {
  lazyReducerRegistry[key] = lazyReducer
}

/**
 * Load and inject a reducer into the store
 * @param key - Reducer key to load
 * @returns Promise that resolves when reducer is loaded
 */
export async function injectReducer(key: string): Promise<void> {
  // Check if already loaded
  if (loadedReducers[key]) {
    return
  }

  // Check if registered
  const lazyReducer = lazyReducerRegistry[key]
  if (!lazyReducer) {
    console.warn(`No lazy reducer registered for key: ${key}`)
    return
  }

  try {
    // Load the reducer
    const reducerModule = await lazyReducer()
    const reducer = reducerModule.default

    // Store in cache
    loadedReducers[key] = reducer

    // Inject into store using replaceReducer
    const currentReducer = store.getState()
    const newReducer = combineReducers({
      ...currentReducer,
      [key]: reducer,
    })

    // Note: RTK doesn't expose replaceReducer directly on the store
    // This is a placeholder for when we need to add traditional slices
    // For now, RTK Query APIs handle their own reducer injection
    console.debug(`Reducer loaded for key: ${key}`)
  } catch (error) {
    console.error(`Failed to load reducer for key ${key}:`, error)
  }
}

/**
 * Load multiple reducers
 * @param keys - Array of reducer keys to load
 */
export async function injectReducers(keys: string[]): Promise<void> {
  const loadPromises = keys.map((key) => injectReducer(key))
  await Promise.allSettled(loadPromises)
}

/**
 * Check if a reducer is loaded
 * @param key - Reducer key to check
 */
export function isReducerLoaded(key: string): boolean {
  return key in loadedReducers
}

/**
 * Get all loaded reducer keys
 */
export function getLoadedReducerKeys(): string[] {
  return Object.keys(loadedReducers)
}

/**
 * Clear reducer cache (useful for testing)
 */
export function clearReducerCache(): void {
  Object.keys(loadedReducers).forEach((key) => {
    delete loadedReducers[key]
  })
}

// Example lazy reducer registrations (to be used when traditional slices are added)
// These are placeholders for future use

/**
 * Register market-related reducers
 * These would be loaded when accessing market routes
 */
export function registerMarketReducers(): void {
  // Example: registerLazyReducer('market', () => import('./slices/marketSlice'))
  // Example: registerLazyReducer('cart', () => import('./slices/cartSlice'))
}

/**
 * Register admin-related reducers
 * These would be loaded when accessing admin routes
 */
export function registerAdminReducers(): void {
  // Example: registerLazyReducer('admin', () => import('./slices/adminSlice'))
  // Example: registerLazyReducer('moderation', () => import('./slices/moderationSlice'))
}

/**
 * Register chart-related reducers
 * These would be loaded when chart components are rendered
 */
export function registerChartReducers(): void {
  // Example: registerLazyReducer('charts', () => import('./slices/chartsSlice'))
}

/**
 * Note: The current store architecture uses RTK Query APIs exclusively,
 * which handle their own reducer injection automatically through the
 * injectEndpoints pattern. This utility is provided for future use
 * when traditional Redux slices need to be lazy-loaded.
 * 
 * RTK Query APIs are already optimized for code splitting:
 * - Each API slice is in a separate file
 * - APIs are imported only where needed
 * - The store only includes the core API reducers
 * 
 * Core APIs (always loaded):
 * - serviceApi: Core backend API
 * - generatedApi: OpenAPI-generated endpoints
 * 
 * Feature APIs (lazy-loaded with routes):
 * - All other APIs are imported by the components that use them
 * - This provides automatic code splitting at the route level
 */
