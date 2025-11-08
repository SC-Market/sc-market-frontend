import React, { useState } from "react"
import { Button, FormControlLabel, Grid, Paper, Switch } from "@mui/material"
import { GridColDef } from "@mui/x-data-grid"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  useGetContractorBySpectrumIDQuery,
  useLeaveContractorMutation,
} from "../../store/contractor"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { useTranslation } from "react-i18next"

export function SettingsManageContractors() {
  const { t } = useTranslation() // ДОДАЙ ОЦЕ!
  const { data: profile } = useGetUserProfileQuery()
  const [showOrgOnProfile, setShowOrgOnProfile] = useState(true)

  const [leaveOrg] = useLeaveContractorMutation()

  const handleLeaveOrg = (spectrum_id: string) => {
    leaveOrg(spectrum_id)
  }

  const columns: GridColDef[] = [
    { field: "name", headerName: t("settingsManageContractors.name"), flex: 1 },
    // {
    //   field: "shown",
    //   renderHeader: () => null,
    //   headerName: t("settingsManageContractors.show_on_profile"),
    //   sortable: true,
    //   renderCell: ({ value }) => (
    //     <FormControlLabel
    //       control={
    //         <Switch
    //           checked={showOrgOnProfile}
    //           onChange={(e) => setShowOrgOnProfile(e.target.checked)}
    //         />
    //       }
    //       label={t("settingsManageContractors.show_org_on_profile")}
    //       sx={{ mb: 2 }}
    //     />
    //   ),
    // },
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

        if (isOwner) {
          return null
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
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
        />
      </Paper>
    </Grid>
  )
}
