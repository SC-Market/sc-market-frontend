import React from "react"
import { useTranslation } from "react-i18next"
import {
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Switch,
  FormControlLabel,
  Autocomplete,
} from "@mui/material"
import { AdminAlert } from "../../datatypes/AdminAlert"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { AdminIcons } from "../../components/icons"
import {
  MarkdownRender,
  MarkdownEditor,
} from "../../components/markdown/Markdown.lazy"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useAdminAlerts } from "../../features/admin/hooks/useAdminAlerts"

export function AdminAlertsView() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const {
    alertsData, isLoading, error, rows,
    page, setPage, pageSize, setPageSize,
    targetTypeFilter, setTargetTypeFilter,
    activeFilter, setActiveFilter,
    selectedAlert,
    isCreateModalOpen, isEditModalOpen, isDeleteModalOpen,
    handleOpenCreateModal, handleOpenEditModal, handleOpenDeleteModal, handleCloseModals,
    formData, setFormData,
    linkError, handleLinkChange,
    contractorError, contractorSearchQuery, setContractorSearchQuery,
    selectedContractor, contractorOptions, isSearchingContractors,
    handleContractorChange, handleTargetTypeChange,
    isCreating, isUpdating, isDeleting,
    handleCreateAlert, handleUpdateAlert, handleDeleteAlert,
    updateAlertMut, issueAlert,
  } = useAdminAlerts()

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("admin.alerts.field.title", "Title"),
      width: 200,
      display: "flex",
      flex: 1,
    },
    {
      field: "target_type",
      headerName: t("admin.alerts.targetType", "Target Type"),
      width: 150,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "link",
      headerName: t("admin.alerts.field.link", "Link"),
      width: 200,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => window.open(params.value, "_blank")}
          >
            {t("admin.alerts.openLink", "Open Link")}
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("admin.alerts.noLink", "No Link")}
          </Typography>
        ),
    },
    {
      field: "created_at",
      headerName: t("admin.alerts.createdAt", "Created"),
      width: 120,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "active",
      headerName: t("admin.alerts.active", "Active"),
      width: 100,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: t("admin.alerts.actions", "Actions"),
      width: 150,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenEditModal(params.row)}
            color="primary"
          >
            <AdminIcons.Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDeleteModal(params.row)}
            color="error"
          >
            <AdminIcons.Delete />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <>
      <Grid
        item
        container
        xs={12}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <HeaderTitle xs={12} md={6}>
          {t("admin.alerts.pageTitle", "Admin Alerts")}
        </HeaderTitle>
      </Grid>

      <Grid
        item
        container
        xs={12}
        spacing={theme.layoutSpacing.layout}
        sx={{ mb: 2 }}
      >
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>
              {t("admin.alerts.targetTypeFilter", "Target Type")}
            </InputLabel>
            <Select
              value={targetTypeFilter}
              label={t("admin.alerts.targetTypeFilter", "Target Type")}
              onChange={(e) => setTargetTypeFilter(e.target.value as typeof targetTypeFilter)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="all_users">All Users</MenuItem>
              <MenuItem value="org_members">Org Members</MenuItem>
              <MenuItem value="org_owners">Org Owners</MenuItem>
              <MenuItem value="admins_only">Admins Only</MenuItem>
              <MenuItem value="specific_org">Specific Org</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>
              {t("admin.alerts.activeFilter", "Active Status")}
            </InputLabel>
            <Select
              value={activeFilter === null ? "" : activeFilter}
              label={t("admin.alerts.activeFilter", "Active Status")}
              onChange={(e) =>
                setActiveFilter(
                  e.target.value === "" ? null : e.target.value === "true",
                )
              }
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            startIcon={<AdminIcons.Add />}
            onClick={handleOpenCreateModal}
            fullWidth
          >
            {t("admin.alerts.createAlert", "Create Alert")}
          </Button>
        </Grid>
      </Grid>

      {alertsData && (
        <Grid item xs={12}>
          <ThemedDataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: {
                paginationModel: { page: page - 1, pageSize },
              },
            }}
            onPaginationModelChange={(model) => {
              setPage(model.page + 1)
              setPageSize(model.pageSize)
            }}
            loading={isLoading}
          />
        </Grid>
      )}
      {error && (
        <Grid item xs={12}>
          <Typography variant="body1" color="error">
            Error loading alerts: {JSON.stringify(error)}
          </Typography>
        </Grid>
      )}

      {/* Create Alert Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={handleCloseModals}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("admin.alerts.createAlert", "Create Alert")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t("admin.alerts.field.title", "Title")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              fullWidth
              label={t("admin.alerts.field.linkOptional", "Link (Optional)")}
              placeholder={t(
                "admin.alerts.linkPlaceholder",
                "https://example.com",
              )}
              value={formData.link || ""}
              onChange={(e) => handleLinkChange(e.target.value)}
              error={!!linkError}
              helperText={linkError}
              sx={{ mb: 2 }}
              type="url"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {t("admin.alerts.targetType", "Target Type")}
              </InputLabel>
              <Select
                value={formData.target_type}
                label={t("admin.alerts.targetType", "Target Type")}
                onChange={(e) => handleTargetTypeChange(e.target.value)}
              >
                <MenuItem value="all_users">All Users</MenuItem>
                <MenuItem value="org_members">Org Members</MenuItem>
                <MenuItem value="org_owners">Org Owners</MenuItem>
                <MenuItem value="admins_only">Admins Only</MenuItem>
                <MenuItem value="specific_org">Specific Org</MenuItem>
              </Select>
            </FormControl>
            {formData.target_type === "specific_org" && (
              <Autocomplete
                fullWidth
                options={contractorOptions}
                getOptionLabel={(option) => option.name}
                value={selectedContractor}
                onChange={(event, newValue) => handleContractorChange(newValue)}
                inputValue={contractorSearchQuery}
                onInputChange={(event, newInputValue) => {
                  setContractorSearchQuery(newInputValue)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t(
                      "admin.alerts.selectContractor",
                      "Select Contractor",
                    )}
                    error={!!contractorError}
                    helperText={contractorError}
                    placeholder={t(
                      "admin.alerts.contractorPlaceholder",
                      "Type to search for contractors...",
                    )}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {option.avatar && (
                        <Box
                          component="img"
                          src={option.avatar}
                          alt={option.name}
                          sx={{ width: 24, height: 24, borderRadius: "50%" }}
                        />
                      )}
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.spectrum_id}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                sx={{ mb: 2 }}
                noOptionsText={t(
                  "admin.alerts.noContractorsFound",
                  "No contractors found",
                )}
                loading={isSearchingContractors}
                loadingText={t("admin.alerts.searching", "Searching...")}
              />
            )}
            <MarkdownEditor
              value={formData.content}
              onChange={(value: string) =>
                setFormData({ ...formData, content: value })
              }
              TextFieldProps={{
                label: t("admin.alerts.content", "Content"),
                placeholder: t(
                  "admin.alerts.contentPlaceholder",
                  "Enter alert content in Markdown format...",
                ),
              }}
              variant="vertical"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleCreateAlert}
            variant="contained"
            disabled={
              isCreating ||
              !formData.title ||
              !formData.content ||
              !!linkError ||
              !!contractorError
            }
          >
            {isCreating
              ? t("admin.alerts.creating", "Creating...")
              : t("admin.alerts.create", "Create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Alert Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseModals}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("admin.alerts.editAlert", "Edit Alert")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t("admin.alerts.field.title", "Title")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              fullWidth
              label={t("admin.alerts.field.linkOptional", "Link (Optional)")}
              placeholder={t(
                "admin.alerts.linkPlaceholder",
                "https://example.com",
              )}
              value={formData.link || ""}
              onChange={(e) => handleLinkChange(e.target.value)}
              error={!!linkError}
              helperText={linkError}
              sx={{ mb: 2 }}
              type="url"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {t("admin.alerts.targetType", "Target Type")}
              </InputLabel>
              <Select
                value={formData.target_type}
                label={t("admin.alerts.targetType", "Target Type")}
                onChange={(e) => handleTargetTypeChange(e.target.value)}
              >
                <MenuItem value="all_users">All Users</MenuItem>
                <MenuItem value="org_members">Org Members</MenuItem>
                <MenuItem value="org_owners">Org Owners</MenuItem>
                <MenuItem value="admins_only">Admins Only</MenuItem>
                <MenuItem value="specific_org">Specific Org</MenuItem>
              </Select>
            </FormControl>
            {formData.target_type === "specific_org" && (
              <Autocomplete
                fullWidth
                options={contractorOptions}
                getOptionLabel={(option) => option.name}
                value={selectedContractor}
                onChange={(event, newValue) => handleContractorChange(newValue)}
                inputValue={contractorSearchQuery}
                onInputChange={(event, newInputValue) => {
                  setContractorSearchQuery(newInputValue)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t(
                      "admin.alerts.selectContractor",
                      "Select Contractor",
                    )}
                    error={!!contractorError}
                    helperText={contractorError}
                    placeholder={t(
                      "admin.alerts.contractorPlaceholder",
                      "Type to search for contractors...",
                    )}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {option.avatar && (
                        <Box
                          component="img"
                          src={option.avatar}
                          alt={option.name}
                          sx={{ width: 24, height: 24, borderRadius: "50%" }}
                        />
                      )}
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.spectrum_id}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                sx={{ mb: 2 }}
                noOptionsText={t(
                  "admin.alerts.noContractorsFound",
                  "No contractors found",
                )}
                loading={isSearchingContractors}
                loadingText={t("admin.alerts.searching", "Searching...")}
              />
            )}
            <MarkdownEditor
              value={formData.content}
              onChange={(value: string) =>
                setFormData({ ...formData, content: value })
              }
              TextFieldProps={{
                label: t("admin.alerts.content", "Content"),
                placeholder: t(
                  "admin.alerts.contentPlaceholder",
                  "Enter alert content in Markdown format...",
                ),
              }}
              variant="vertical"
            />
            {selectedAlert && (
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedAlert.active}
                    onChange={(e) => {
                      if (selectedAlert) {
                        updateAlertMut({
                          alertId: selectedAlert.alert_id,
                          data: { active: e.target.checked },
                        })
                          .unwrap()
                          .then(() => {
                            issueAlert({
                              message: t(
                                "admin.alerts.updated",
                                "Alert updated successfully",
                              ),
                              severity: "success",
                            })
                          })
                          .catch((error) => {
                            issueAlert(error)
                          })
                      }
                    }}
                  />
                }
                label={t("admin.alerts.active", "Active")}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleUpdateAlert}
            variant="contained"
            disabled={
              isUpdating ||
              !formData.title ||
              !formData.content ||
              !!linkError ||
              !!contractorError
            }
          >
            {isUpdating
              ? t("admin.alerts.updating", "Updating...")
              : t("admin.alerts.update", "Update")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Alert Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={handleCloseModals}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("admin.alerts.deleteAlert", "Delete Alert")}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t(
              "admin.alerts.deleteConfirm",
              "Are you sure you want to delete this alert? This action cannot be undone.",
            )}
          </Typography>
          {selectedAlert && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "grey.100",
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <Typography variant="h6">{selectedAlert.title}</Typography>
              <MarkdownRender text={selectedAlert.content} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleDeleteAlert}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting
              ? t("admin.alerts.deleting", "Deleting...")
              : t("admin.alerts.delete", "Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
