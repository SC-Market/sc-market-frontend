import { useCallback, useEffect, useMemo, useState } from "react"
import React from "react"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useGetContractorMembersQuery, contractorsApi } from "../../contractor/api/contractorApi"
import { useAssignOrderMutation, useUnassignOrderMutation } from "../api/ordersApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { store } from "../../../store/store"
import type { MinimalUser } from "../../../datatypes/User"
import throttle from "lodash/throttle"

export function useMemberAssign(orderId: string) {
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{
    username: string
    display_name: string
  } | null>(null)
  const [currentOrg] = useCurrentOrg()
  const [options, setOptions] = useState<MinimalUser[]>([])
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: currentOrg?.spectrum_id || "",
    page: 0,
    page_size: 100,
    search: "",
    role_filter: "",
    sort: "username",
  })

  const members = membersData?.members || []

  const fetchOptions = useCallback(
    async (query: string) => {
      if (query.length < 3) return
      const { data } = await store.dispatch(
        contractorsApi.endpoints.searchContractorMembers.initiate({
          spectrum_id: currentOrg?.spectrum_id!,
          query,
        }),
      )
      setOptions(data || [])
    },
    [currentOrg?.spectrum_id],
  )

  const retrieve = useMemo(
    () => throttle((query: string) => fetchOptions(query), 400),
    [fetchOptions],
  )

  useEffect(() => {
    retrieve(target)
  }, [target, retrieve])

  const [assignUser] = useAssignOrderMutation()
  const [unassignUser] = useUnassignOrderMutation()

  const updateAssignment = useCallback(async () => {
    if (!targetObject) return
    const res = await assignUser({
      order_id: orderId,
      username: targetObject.username,
    })
    if ("data" in res && !("error" in res)) {
      issueAlert({ message: t("memberAssignArea.assigned"), severity: "success" })
    } else {
      const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
      issueAlert({
        message: `${t("memberAssignArea.failed_assign")} ${error?.error || error?.data?.error || ""}`,
        severity: "error",
      })
    }
  }, [assignUser, orderId, issueAlert, targetObject, t])

  const removeAssignment = useCallback(async () => {
    const res = await unassignUser({ order_id: orderId })
    if ("data" in res && !("error" in res)) {
      issueAlert({ message: t("memberAssignArea.unassigned"), severity: "success" })
    } else {
      const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
      issueAlert({
        message: `${t("memberAssignArea.failed_unassign")} ${error?.error || error?.data?.error || ""}`,
        severity: "error",
      })
    }
  }, [unassignUser, orderId, issueAlert, t])

  return {
    target,
    setTarget,
    targetObject,
    setTargetObject,
    options,
    members,
    updateAssignment,
    removeAssignment,
  }
}
