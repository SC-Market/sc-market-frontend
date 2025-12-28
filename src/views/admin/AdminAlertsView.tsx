import React, { useState, useCallback, useMemo } from "react"
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
import {
  useGetAdminAlertsQuery,
  useCreateAdminAlertMutation,
  useUpdateAdminAlertMutation,
  useDeleteAdminAlertMutation,
} from "../../store/admin"
import { AdminAlert, AdminAlertCreate } from "../../datatypes/AdminAlert"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import AddIcon from "@mui/icons-material/AddRounded"
import EditIcon from "@mui/icons-material/EditRounded"
import DeleteIcon from "@mui/icons-material/DeleteRounded"
import {
  MarkdownRender,
  MarkdownEditor,
} from "../../components/markdown/Markdown"
import { MinimalContractor } from "../../datatypes/Contractor"
import { useSearchContractorsQuery } from "../../store/contractor"

export function AdminAlertsView() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [targetTypeFilter, setTargetTypeFilter] = useState<
    | "all_users"
    | "org_members"
    | "org_owners"
    | "admins_only"
    | "specific_org"
    | ""
  >("")
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const {
    data: alertsData,
    isLoading,
    error,
  } = useGetAdminAlertsQuery({
    page: page - 1,
    pageSize,
    target_type: targetTypeFilter || undefined,
    active: activeFilter !== null ? activeFilter : undefined,
  })

  const [createAlert, { isLoading: isCreating }] = useCreateAdminAlertMutation()
  const [updateAlert, { isLoading: isUpdating }] = useUpdateAdminAlertMutation()
  const [deleteAlert, { isLoading: isDeleting }] = useDeleteAdminAlertMutation()

  const issueAlert = useAlertHook()

  // Form state for create/edit
  const [formData, setFormData] = useState<AdminAlertCreate>({
    title: "",
    content: "",
    link: null,
    target_type: "all_users",
    target_spectrum_id: null,
  })

  // Validation state
  const [linkError, setLinkError] = useState<string>("")
  const [contractorError, setContractorError] = useState<string>("")

  // Contractor search state
  const [contractorSearchQuery, setContractorSearchQuery] = useState<string>("")
  const [selectedContractor, setSelectedContractor] =
    useState<MinimalContractor | null>(null)

  // RTK Query for contractor search with throttling
  const { data: contractorOptions = [], isLoading: isSearchingContractors } =
    useSearchContractorsQuery(
      { query: contractorSearchQuery },
      {
        skip: contractorSearchQuery.length < 3, // Only search when query is 3+ characters
      },
    )

  // URL validation function
  const validateUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return true // Empty is valid (optional field)

    try {
      const urlObj = new URL(url)
      // Only allow http and https protocols
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  // Handle link change with validation
  const handleLinkChange = (value: string) => {
    const trimmedValue = value.trim()
    const newLink = trimmedValue === "" ? null : trimmedValue

    setFormData({ ...formData, link: newLink })

    // Validate the URL
    if (newLink && !validateUrl(newLink)) {
      setLinkError(
        t(
          "admin.alerts.invalidUrl",
          "Please enter a valid URL (http:// or https://)",
        ),
      )
    } else {
      setLinkError("")
    }
  }

  // Handle contractor selection
  const handleContractorChange = (contractor: MinimalContractor | null) => {
    setSelectedContractor(contractor)
    setFormData({
      ...formData,
      target_spectrum_id: contractor?.spectrum_id || null,
    })

    // Clear contractor error when a contractor is selected
    if (contractor) {
      setContractorError("")
    }
  }

  // Handle target type change
  const handleTargetTypeChange = (targetType: string) => {
    setFormData({ ...formData, target_type: targetType as any })

    // Clear contractor selection and error when target type changes away from specific_org
    if (targetType !== "specific_org") {
      setSelectedContractor(null)
      setFormData((prev) => ({ ...prev, target_spectrum_id: null }))
      setContractorError("")
    }
  }

  const handleOpenCreateModal = () => {
    setFormData({
      title: "",
      content: "",
      link: null,
      target_type: "all_users",
      target_spectrum_id: null,
    })
    setLinkError("")
    setContractorError("")
    setSelectedContractor(null)
    setContractorSearchQuery("")
    setIsCreateModalOpen(true)
  }

  const handleOpenEditModal = (alert: AdminAlert) => {
    setSelectedAlert(alert)
    setFormData({
      title: alert.title,
      content: alert.content,
      link: alert.link,
      target_type: alert.target_type,
      target_spectrum_id: alert.target_spectrum_id,
    })
    setLinkError("")
    setContractorError("")
    setSelectedContractor(null) // Will be set if target_spectrum_id exists
    setContractorSearchQuery("")
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteModal = (alert: AdminAlert) => {
    setSelectedAlert(alert)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedAlert(null)
    setFormData({
      title: "",
      content: "",
      link: null,
      target_type: "all_users",
      target_spectrum_id: null,
    })
    setLinkError("")
    setContractorError("")
    setSelectedContractor(null)
    setContractorSearchQuery("")
  }

  const handleCreateAlert = () => {
    // Check for validation errors
    if (linkError) {
      return
    }

    // Validate contractor selection for specific_org
    if (
      formData.target_type === "specific_org" &&
      !formData.target_spectrum_id
    ) {
      setContractorError(
        t("admin.alerts.contractorRequired", "Please select a contractor"),
      )
      return
    }

    createAlert(formData)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("admin.alerts.created", "Alert created successfully"),
          severity: "success",
        })
        handleCloseModals()
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const handleUpdateAlert = () => {
    if (!selectedAlert) return

    // Check for validation errors
    if (linkError) {
      return
    }

    // Validate contractor selection for specific_org
    if (
      formData.target_type === "specific_org" &&
      !formData.target_spectrum_id
    ) {
      setContractorError(
        t("admin.alerts.contractorRequired", "Please select a contractor"),
      )
      return
    }

    updateAlert({
      alertId: selectedAlert.alert_id,
      data: formData,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("admin.alerts.updated", "Alert updated successfully"),
          severity: "success",
        })
        handleCloseModals()
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const handleDeleteAlert = () => {
    if (!selectedAlert) return

    deleteAlert(selectedAlert.alert_id)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("admin.alerts.deleted", "Alert deleted successfully"),
          severity: "success",
        })
        handleCloseModals()
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("admin.alerts.title", "Title"),
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
      headerName: t("admin.alerts.link", "Link"),
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
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDeleteModal(params.row)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ]

  const rows = React.useMemo(() => {
    if (!alertsData?.alerts) return []
    return alertsData.alerts.map((alert) => ({
      ...alert,
      id: alert.alert_id,
    }))
  }, [alertsData?.alerts])

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
          {t("admin.alerts.title", "Admin Alerts")}
        </HeaderTitle>
      </Grid>

      <Grid item container xs={12} spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>
              {t("admin.alerts.targetTypeFilter", "Target Type")}
            </InputLabel>
            <Select
              value={targetTypeFilter}
              label={t("admin.alerts.targetTypeFilter", "Target Type")}
              onChange={(e) => setTargetTypeFilter(e.target.value as any)}
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
            startIcon={<AddIcon />}
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
              label={t("admin.alerts.title", "Title")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              fullWidth
              label={t("admin.alerts.link", "Link (Optional)")}
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
              label={t("admin.alerts.title", "Title")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              fullWidth
              label={t("admin.alerts.link", "Link (Optional)")}
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
                        updateAlert({
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
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
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
