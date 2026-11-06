/** Org roles: create, update and delete a role. Each alerts the outcome. */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import omit from "lodash/omit"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useCreateContractorRoleMutation,
  useDeleteContractorRoleMutation,
  useUpdateContractorRoleMutation,
} from "../api/contractorApi"
import type { ContractorRole } from "../domain/types"

export function useOrgRoleActions(spectrumId: string | undefined) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createRole] = useCreateContractorRoleMutation()
  const [updateRole] = useUpdateContractorRoleMutation()
  const [deleteRole] = useDeleteContractorRoleMutation()

  /** Resolves to whether the role was created. */
  const create = useCallback(
    async (role: ContractorRole): Promise<boolean> => {
      try {
        await createRole({
          contractor: spectrumId!,
          body: omit(role, ["contractor_id", "role_id", "position"]),
        }).unwrap()
        issueAlert({
          message: t("manageRoles.updated"),
          severity: "success",
        })
        return true
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
        return false
      }
    },
    [createRole, spectrumId, issueAlert, t],
  )

  const update = useCallback(
    async (roleId: string, role: ContractorRole) => {
      try {
        await updateRole({
          contractor: spectrumId!,
          role_id: roleId,
          body: omit(role, ["contractor_id", "role_id"]),
        }).unwrap()
        issueAlert({
          message: t("manageRoles.updated"),
          severity: "success",
        })
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
      }
    },
    [updateRole, spectrumId, issueAlert, t],
  )

  const remove = useCallback(
    async (roleId: string) => {
      try {
        await deleteRole({ contractor: spectrumId!, role_id: roleId }).unwrap()
        issueAlert({
          message: t("manageRoles.deleted"),
          severity: "success",
        })
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
      }
    },
    [deleteRole, spectrumId, issueAlert, t],
  )

  return { create, update, remove }
}
