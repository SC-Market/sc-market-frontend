import React from "react"
import {
  Button,
  Chip,
  Grid,
  Paper,
  TextField,
  Autocomplete,
  Avatar,
  Box,
  Typography,
} from "@mui/material"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { useManageContractors } from "../../features/contractor/hooks/useManageContractors"
import type { MinimalContractor } from "../../features/contractor/domain/types"
import type { UserProfileState } from "../../hooks/login/UserProfile"

export function SettingsManageContractors() {
  const { t } = useTranslation()
  const {
    profile,
    archiveTarget,
    setArchiveTarget,
    archiveReason,
    setArchiveReason,
    isArchiving,
    handleArchiveOrg,
    transferTarget,
    setTransferTarget,
    transferSearchQuery,
    setTransferSearchQuery,
    transferSelectedUser,
    setTransferSelectedUser,
    transferSearchOptions,
    transferMembers,
    setTransferSearchOptions,
    isTransferring,
    handleTransferOwnership,
    handleLeaveOrg,
  } = useManageContractors()

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("settingsManageContractors.name"),
      flex: 0.6,
      minWidth: 150,
    },
    {
      field: "actions",
      headerName: t("settingsManageContractors.actions"),
      flex: 1.4,
      minWidth: 300,
      sortable: false,
      align: "right",
      renderCell: ({ row }) => (
        <ContractorActions
          row={row}
          profile={profile}
          onTransfer={(spectrum_id, name) =>
            setTransferTarget({ spectrum_id, name })
          }
          onArchive={(spectrum_id, name) =>
            setArchiveTarget({ spectrum_id, name })
          }
          onLeave={handleLeaveOrg}
        />
      ),
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
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => {
          setArchiveTarget(null)
          setArchiveReason("")
        }}
        title={t("settingsManageContractors.disband_org_confirm_title")}
        message={t("settingsManageContractors.disband_org_confirm_body", {
          name: archiveTarget?.name ?? "",
        })}
        cancelLabel={t(
          "settingsManageContractors.disband_org_confirm_cancel_button",
        )}
        confirmLabel={t(
          "settingsManageContractors.disband_org_confirm_confirm_button",
        )}
        destructive
        loading={isArchiving}
        onConfirm={handleArchiveOrg}
      >
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
      </ConfirmDialog>
      <ConfirmDialog
        open={Boolean(transferTarget)}
        onClose={() => {
          setTransferTarget(null)
          setTransferSearchQuery("")
          setTransferSelectedUser(null)
          setTransferSearchOptions([])
        }}
        maxWidth="sm"
        title={t("settingsManageContractors.transfer_ownership_confirm_title")}
        message={t(
          "settingsManageContractors.transfer_ownership_confirm_body",
          {
            name: transferTarget?.name ?? "",
          },
        )}
        cancelLabel={t(
          "settingsManageContractors.transfer_ownership_confirm_cancel_button",
        )}
        confirmLabel={t(
          "settingsManageContractors.transfer_ownership_confirm_confirm_button",
        )}
        loading={isTransferring}
        confirmDisabled={!transferSelectedUser}
        onConfirm={handleTransferOwnership}
      >
        <Autocomplete
          filterOptions={(x) => x}
          fullWidth
          options={
            transferSearchQuery
              ? transferSearchOptions
              : transferMembers
                  .map((u) => ({
                    username: u.username,
                    display_name: u.display_name || u.username,
                    avatar: u.avatar,
                  }))
                  .slice(0, 8)
          }
          getOptionLabel={(option) =>
            `${option.display_name || option.username} (@${option.username})`
          }
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Avatar
                src={option.avatar}
                sx={{ width: 32, height: 32, mr: 2 }}
              />
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {option.display_name || option.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{option.username}
                </Typography>
              </Box>
            </Box>
          )}
          disablePortal
          value={transferSelectedUser}
          onChange={(
            _event: React.SyntheticEvent,
            newValue: {
              display_name: string
              username: string
              avatar?: string
            } | null,
          ) => {
            setTransferSelectedUser(newValue)
          }}
          inputValue={transferSearchQuery}
          onInputChange={(event, newInputValue) => {
            setTransferSearchQuery(newInputValue)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t(
                "settingsManageContractors.transfer_ownership_confirm_username_label",
              )}
              placeholder={t(
                "settingsManageContractors.transfer_ownership_confirm_username_placeholder",
              )}
              disabled={isTransferring}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            />
          )}
          disabled={isTransferring}
        />
      </ConfirmDialog>
    </Grid>
  )
}

function ContractorActions(props: {
  row: MinimalContractor & { roles: string[]; role: string; archived?: boolean }
  profile: UserProfileState | undefined
  onTransfer: (spectrum_id: string, name: string) => void
  onArchive: (spectrum_id: string, name: string) => void
  onLeave: (spectrum_id: string) => void
}) {
  const { row, profile, onTransfer, onArchive, onLeave } = props
  const { t } = useTranslation()
  const { data: contractor } = useGetContractorBySpectrumIDQuery(
    row.spectrum_id,
  )

  const ownerRole = contractor?.owner_role
  const userContractor = profile?.contractors?.find(
    (c) => c.spectrum_id === contractor?.spectrum_id,
  )
  const isOwner =
    ownerRole && userContractor?.roles.find((r: string) => r === ownerRole)

  if (contractor?.archived || row.archived) {
    return <Chip label={t("settingsManageContractors.archived_label")} />
  }

  if (isOwner) {
    return (
      <>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onTransfer(row.spectrum_id, row.name)}
          sx={{ mr: 1 }}
        >
          {t("settingsManageContractors.transfer_ownership")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => onArchive(row.spectrum_id, row.name)}
        >
          {t("settingsManageContractors.disband_org")}
        </Button>
      </>
    )
  }

  return (
    <Button
      variant="outlined"
      color="error"
      onClick={() => onLeave(row.spectrum_id)}
    >
      {t("settingsManageContractors.leave_org")}
    </Button>
  )
}
