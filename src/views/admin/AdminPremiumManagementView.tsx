import React, { useState } from "react"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import {
  useGetPremiumOrgsQuery,
  useSetOrgPremiumMutation,
  useRevokeOrgPremiumMutation,
  PremiumTier,
} from "../../store/api/premium"
import { useSearchContractorsQuery } from "../../store/api/contractors"
import { useTranslation } from "react-i18next"

export function AdminPremiumManagementView() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContractorId, setSelectedContractorId] = useState("")
  const [selectedTier, setSelectedTier] = useState("white_label")
  const [selectedDomain, setSelectedDomain] = useState("")

  const { data, isLoading } = useGetPremiumOrgsQuery({ page, page_size: 20 })
  const { data: searchResults } = useSearchContractorsQuery(
    { query: searchQuery },
    { skip: searchQuery.length < 2 },
  )
  const [setOrgPremium, { isLoading: isSetting }] = useSetOrgPremiumMutation()
  const [revokeOrgPremium, { isLoading: isRevoking }] =
    useRevokeOrgPremiumMutation()

  const handleGrant = async () => {
    if (!selectedContractorId) return
    await setOrgPremium({
      contractor_id: selectedContractorId,
      tier: selectedTier,
      custom_domain: selectedDomain || null,
    })
    setGrantDialogOpen(false)
    setSelectedContractorId("")
    setSearchQuery("")
    setSelectedDomain("")
  }

  const handleRevoke = async (contractorId: string) => {
    await revokeOrgPremium(contractorId)
  }

  const columns: GridColDef[] = [
    {
      field: "contractor_name",
      headerName: t("admin.premium.org", "Organization"),
      flex: 1,
    },
    {
      field: "spectrum_id",
      headerName: t("admin.premium.spectrumId", "Spectrum ID"),
      flex: 1,
    },
    {
      field: "tier",
      headerName: t("admin.premium.tier", "Tier"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "custom_domain",
      headerName: t("admin.premium.domain", "Custom Domain"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Chip label={params.value} size="small" variant="outlined" />
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      field: "granted_at",
      headerName: t("admin.premium.grantedAt", "Granted"),
      width: 180,
      valueFormatter: (value: string) =>
        value ? new Date(value).toLocaleDateString() : "",
    },
    {
      field: "revoked_at",
      headerName: t("admin.premium.status", "Status"),
      width: 120,
      renderCell: (params: GridRenderCellParams<PremiumTier>) => (
        <Chip
          label={params.value ? "Revoked" : "Active"}
          color={params.value ? "default" : "success"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<PremiumTier>) =>
        !params.row.revoked_at ? (
          <Button
            size="small"
            color="error"
            onClick={() => handleRevoke(params.row.contractor_id)}
            disabled={isRevoking}
          >
            {t("admin.premium.revoke", "Revoke")}
          </Button>
        ) : null,
    },
  ]

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <HeaderTitle>
            {t("admin.premium.title", "Premium Management")}
          </HeaderTitle>
          <Button
            variant="contained"
            onClick={() => setGrantDialogOpen(true)}
          >
            {t("admin.premium.grant", "Grant Premium")}
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <ThemedDataGrid
          rows={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          pageSizeOptions={[20]}
          paginationModel={{ page: page - 1, pageSize: 20 }}
          onPaginationModelChange={(model) => setPage(model.page + 1)}
          rowCount={data?.total ?? 0}
          paginationMode="server"
          autoHeight
        />
      </Grid>

      <Dialog
        open={grantDialogOpen}
        onClose={() => setGrantDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("admin.premium.grantTitle", "Grant Premium Tier")}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("admin.premium.searchOrg", "Search organization")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          {searchResults && searchQuery.length >= 2 && (
            <Box sx={{ mb: 2, maxHeight: 200, overflow: "auto" }}>
              {((searchResults as any)?.data ?? []).map((org: any) => (
                <Button
                  key={org.spectrum_id}
                  fullWidth
                  variant={
                    selectedContractorId === org.contractor_id
                      ? "contained"
                      : "text"
                  }
                  onClick={() => setSelectedContractorId(org.contractor_id)}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  <Typography>{org.name}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {org.spectrum_id}
                  </Typography>
                </Button>
              ))}
            </Box>
          )}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>{t("admin.premium.tier", "Tier")}</InputLabel>
            <Select
              value={selectedTier}
              label={t("admin.premium.tier", "Tier")}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              <MenuItem value="white_label">White Label</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label={t("admin.premium.domain", "Custom Domain")}
            placeholder="org.sc-market.space"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            sx={{ mt: 2 }}
            helperText={t(
              "admin.premium.domainHelp",
              "The hostname for this org's white-label site. Configure DNS to point here.",
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrantDialogOpen(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleGrant}
            disabled={!selectedContractorId || isSetting}
          >
            {t("admin.premium.grant", "Grant Premium")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
