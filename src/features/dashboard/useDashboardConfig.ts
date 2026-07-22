/**
 * useDashboardConfig — server-persisted dashboard layout with a localStorage cache.
 *
 * P0 persistence is server-side (dashboard_layouts): the server is the source of
 * truth. localStorage is only a render-time cache keyed by owner, hydrated first
 * to avoid a blank flash, then reconciled with the server response. Saves are
 * debounced and written optimistically.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  useGetLayoutQuery,
  useSaveLayoutMutation,
} from "../../store/api/v2/market"
import { parseConfig } from "./config"
import {
  emptyConfig,
  type DashboardConfig,
  type DashboardOwnerRef,
} from "./types"

const SAVE_DEBOUNCE_MS = 800

function cacheKey(owner: DashboardOwnerRef): string {
  return `dashboard_layout:${owner.ownerType}:${owner.ownerId}`
}

function readCache(owner: DashboardOwnerRef): DashboardConfig {
  try {
    const stored = localStorage.getItem(cacheKey(owner))
    if (stored) return parseConfig(stored)
  } catch {}
  return emptyConfig()
}

function writeCache(owner: DashboardOwnerRef, config: DashboardConfig): void {
  try {
    localStorage.setItem(cacheKey(owner), JSON.stringify(config))
  } catch {}
}

export interface UseDashboardConfigResult {
  config: DashboardConfig
  /** True until the first server response resolves. */
  isLoading: boolean
  /** True while a save is in flight. */
  isSaving: boolean
  /** Whether the current user may edit this dashboard (server-enforced too). */
  canEdit: boolean
  /** Replace the whole config (used by add/remove/layout changes and import). */
  setConfig: (next: DashboardConfig) => void
  error: unknown
}

export function useDashboardConfig(
  owner: DashboardOwnerRef,
  options?: { canEdit?: boolean },
): UseDashboardConfigResult {
  const canEdit = options?.canEdit ?? owner.ownerType === "user"

  const {
    data,
    isLoading: queryLoading,
    error,
  } = useGetLayoutQuery(
    { ownerType: owner.ownerType, ownerId: owner.ownerId },
    { skip: !owner.ownerId },
  )

  const [saveLayout, { isLoading: isSaving }] = useSaveLayoutMutation()

  // Seed from cache synchronously so the grid renders immediately.
  const [config, setConfigState] = useState<DashboardConfig>(() =>
    readCache(owner),
  )

  // Re-seed from cache when the owner changes (switching context).
  const ownerId = owner.ownerId
  const ownerType = owner.ownerType
  useEffect(() => {
    setConfigState(readCache({ ownerType, ownerId }))
  }, [ownerType, ownerId])

  // Reconcile with the server response once it arrives.
  useEffect(() => {
    if (data === undefined) return // still loading
    const serverConfig = data?.config ? parseConfig(data.config) : emptyConfig()
    writeCache({ ownerType, ownerId }, serverConfig)
    setConfigState(serverConfig)
  }, [data, ownerType, ownerId])

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    },
    [],
  )

  const setConfig = useCallback(
    (next: DashboardConfig) => {
      setConfigState(next)
      writeCache({ ownerType, ownerId }, next)
      if (!canEdit) return

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void saveLayout({
          updateDashboardLayoutRequest: {
            owner_type: ownerType,
            owner_id: ownerId,
            config: next,
          },
        })
      }, SAVE_DEBOUNCE_MS)
    },
    [canEdit, ownerType, ownerId, saveLayout],
  )

  return useMemo(
    () => ({
      config,
      isLoading: queryLoading,
      isSaving,
      canEdit,
      setConfig,
      error,
    }),
    [config, queryLoading, isSaving, canEdit, setConfig, error],
  )
}
