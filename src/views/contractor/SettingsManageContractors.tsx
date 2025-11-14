import React, { useState } from "react"
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  TextField,
} from "@mui/material"
import { GridColDef } from "@mui/x-data-grid"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  useGetContractorBySpectrumIDQuery,
  useArchiveContractorMutation,
  useLeaveContractorMutation,
} from "../../store/contractor"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"

export function SettingsManageContractors() {
  const { t } = useTranslation() // ДОДАЙ ОЦЕ!
  const { data: profile } = useGetUserProfileQuery()

  const [leaveOrg] = useLeaveContractorMutation()
  const [archiveContractor, { isLoading: isArchiving }] =
    useArchiveContractorMutation()
  const issueAlert = useAlertHook()

  const [archiveTarget, setArchiveTarget] = useState<{
    spectrum_id: string
    name: string
  } | null>(null)
  const [archiveReason, setArchiveReason] = useState("")

  const handleLeaveOrg = (spectrum_id: string) => {
    leaveOrg(spectrum_id)
  }

  const handleArchiveOrg = () => {
    if (!archiveTarget) return
    archiveContractor({
      spectrum_id: archiveTarget.spectrum_id,
      reason: archiveReason.trim() || undefined,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("settingsManageContractors.disband_org_success", {
            name: archiveTarget.name,
          }),
          severity: "success",
        })
        setArchiveTarget(null)
        setArchiveReason("")
      })
      .catch(() => {
        issueAlert({
          message: t("settingsManageContractors.disband_org_error", {
            name: archiveTarget.name,
          }),
          severity: "error",
        })
      })
  }

  const columns: GridColDef[] = [
    { field: "name", headerName: t("settingsManageContractors.name"), flex: 1 },
    {
      field: "actions",
      headerName: t("settingsManageContractors.actions"),
      flex: 1,
      sortable: false,
      align: "right",
      renderCell: ({ row }) => {
        const { data: contractor } = useGetContractorBySpectrumIDQuery(
          row.spectrum_id,
        )

        const ownerRole = contractor?.owner_role

        // Check if user is owner using profile contractors
        const userContractor = profile?.contractors?.find(
          (c) => c.spectrum_id === contractor?.spectrum_id,
        )
        const isOwner =
          ownerRole && userContractor?.roles.find((r) => r === ownerRole)

        if (contractor?.archived || row.archived) {
          return <Chip label={t("settingsManageContractors.archived_label")} />
        }

        if (isOwner) {
          return (
            <Button
              variant="contained"
              color="error"
              onClick={() =>
                setArchiveTarget({
                  spectrum_id: row.spectrum_id,
                  name: row.name,
                })
              }
            >
              {t("settingsManageContractors.disband_org")}
            </Button>
          )
        }

        return (
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleLeaveOrg(row.spectrum_id)}
          >
            {t("settingsManageContractors.leave_org")}
          </Button>
        )
      },
    },
  ]

  return (
    <Grid item xs={12}>
      <Paper>
        <ThemedDataGrid
          rows={profile?.contractors || []}
          getRowId={(row) => row.spectrum_id}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          rowSelection={false}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
        />
      </Paper>
      <Dialog
        open={Boolean(archiveTarget)}
        onClose={() => {
          if (!isArchiving) {
            setArchiveTarget(null)
            setArchiveReason("")
          }
        }}
      >
        <DialogTitle>
          {t("settingsManageContractors.disband_org_confirm_title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("settingsManageContractors.disband_org_confirm_body", {
              name: archiveTarget?.name ?? "",
            })}
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={archiveReason}
            onChange={(event) => setArchiveReason(event.target.value)}
            label={t(
              "settingsManageContractors.disband_org_confirm_reason_label",
            )}
            placeholder={t(
              "settingsManageContractors.disband_org_confirm_reason_placeholder",
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (!isArchiving) {
                setArchiveTarget(null)
                setArchiveReason("")
              }
            }}
            disabled={isArchiving}
          >
            {t("settingsManageContractors.disband_org_confirm_cancel_button")}
          </Button>
          <Button
            onClick={handleArchiveOrg}
            color="error"
            variant="contained"
            disabled={isArchiving}
          >
            {t("settingsManageContractors.disband_org_confirm_confirm_button")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
