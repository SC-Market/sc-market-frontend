import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Typography,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material"
import {
  useGetAttributeDefinitionsQuery,
  useCreateAttributeDefinitionMutation,
  useUpdateAttributeDefinitionMutation,
  useDeleteAttributeDefinitionMutation,
  AttributeDefinition,
  CreateAttributeDefinitionPayload,
  UpdateAttributeDefinitionPayload,
} from "../../store/api/attributes"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import AddIcon from "@mui/icons-material/AddRounded"
import EditIcon from "@mui/icons-material/EditRounded"
import DeleteIcon from "@mui/icons-material/DeleteRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function AdminAttributeDefinitionsView() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDefinition, setSelectedDefinition] =
    useState<AttributeDefinition | null>(null)

  const {
    data: definitionsData,
    isLoading,
    error,
  } = useGetAttributeDefinitionsQuery({ include_hidden: true })

  const [createDefinition, { isLoading: isCreating }] =
    useCreateAttributeDefinitionMutation()
  const [updateDefinition, { isLoading: isUpdating }] =
    useUpdateAttributeDefinitionMutation()
  const [deleteDefinition, { isLoading: isDeleting }] =
    useDeleteAttributeDefinitionMutation()

  const issueAlert = useAlertHook()

  // Form state
  const [formData, setFormData] = useState<CreateAttributeDefinitionPayload>({
    attribute_name: "",
    display_name: "",
    attribute_type: "select",
    allowed_values: null,
    applicable_item_types: null,
    display_order: 0,
    show_in_filters: false,
  })

  const [allowedValuesInput, setAllowedValuesInput] = useState<string>("")
  const [cascadeDelete, setCascadeDelete] = useState(false)

  const handleOpenCreateModal = () => {
    setFormData({
      attribute_name: "",
      display_name: "",
      attribute_type: "select",
      allowed_values: null,
      applicable_item_types: null,
      display_order: 0,
    })
    setAllowedValuesInput("")
    setIsCreateModalOpen(true)
  }

  const handleOpenEditModal = (definition: AttributeDefinition) => {
    setSelectedDefinition(definition)
    setFormData({
      attribute_name: definition.attribute_name,
      display_name: definition.display_name,
      attribute_type: definition.attribute_type,
      allowed_values: definition.allowed_values,
      applicable_item_types: definition.applicable_item_types,
      display_order: definition.display_order,
      show_in_filters: definition.show_in_filters,
    })
    setAllowedValuesInput(
      definition.allowed_values ? definition.allowed_values.join(", ") : "",
    )
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteModal = (definition: AttributeDefinition) => {
    setSelectedDefinition(definition)
    setCascadeDelete(false)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedDefinition(null)
    setFormData({
      attribute_name: "",
      display_name: "",
      attribute_type: "select",
      allowed_values: null,
      applicable_item_types: null,
      display_order: 0,
    })
    setAllowedValuesInput("")
    setCascadeDelete(false)
  }

  const parseAllowedValues = (input: string): string[] | null => {
    if (!input.trim()) return null
    return input
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
  }

  const handleCreateDefinition = () => {
    const payload: CreateAttributeDefinitionPayload = {
      ...formData,
      allowed_values: parseAllowedValues(allowedValuesInput),
    }

    createDefinition(payload)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t(
            "admin.attributes.created",
            "Attribute definition created successfully",
          ),
          severity: "success",
        })
        handleCloseModals()
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const handleUpdateDefinition = () => {
    if (!selectedDefinition) return

    const payload: UpdateAttributeDefinitionPayload = {
      display_name: formData.display_name,
      attribute_type: formData.attribute_type,
      allowed_values: parseAllowedValues(allowedValuesInput),
      applicable_item_types: formData.applicable_item_types,
      display_order: formData.display_order,
    }

    updateDefinition({
      name: selectedDefinition.attribute_name,
      data: payload,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t(
            "admin.attributes.updated",
            "Attribute definition updated successfully",
          ),
          severity: "success",
        })
        handleCloseModals()
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const handleDeleteDefinition = () => {
    if (!selectedDefinition) return

    deleteDefinition({
      name: selectedDefinition.attribute_name,
      cascade: cascadeDelete,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t(
            "admin.attributes.deleted",
            "Attribute definition deleted successfully",
          ),
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
      field: "attribute_name",
      headerName: t("admin.attributes.attributeName", "Attribute Name"),
      width: 150,
      display: "flex",
      flex: 1,
    },
    {
      field: "display_name",
      headerName: t("admin.attributes.displayName", "Display Name"),
      width: 150,
      display: "flex",
      flex: 1,
    },
    {
      field: "attribute_type",
      headerName: t("admin.attributes.field.type", "Type"),
      width: 120,
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
      field: "allowed_values",
      headerName: t("admin.attributes.allowedValues", "Allowed Values"),
      width: 200,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Typography variant="body2" noWrap>
            {params.value.join(", ")}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("admin.attributes.anyValue", "Any value")}
          </Typography>
        ),
    },
    {
      field: "applicable_item_types",
      headerName: t(
        "admin.attributes.field.applicableTypes",
        "Applicable Types",
      ),
      width: 200,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Typography variant="body2" noWrap>
            {params.value.join(", ")}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("admin.attributes.allTypes", "All types")}
          </Typography>
        ),
    },
    {
      field: "display_order",
      headerName: t("admin.attributes.field.order", "Order"),
      width: 80,
      display: "flex",
      flex: 1,
    },
    {
      field: "actions",
      headerName: t("admin.attributes.actions", "Actions"),
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
    if (!definitionsData?.definitions) return []
    return definitionsData.definitions.map((def) => ({
      ...def,
      id: def.attribute_name,
    }))
  }, [definitionsData?.definitions])

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
          {t("admin.attributes.title", "Attribute Definitions")}
        </HeaderTitle>
        <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
          >
            {t("admin.attributes.button.create", "Create Definition")}
          </Button>
        </Grid>
      </Grid>

      {definitionsData && (
        <Grid item xs={12}>
          <ThemedDataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            autoHeight
            loading={isLoading}
          />
        </Grid>
      )}
      {error && (
        <Grid item xs={12}>
          <Typography variant="body1" color="error">
            Error loading attribute definitions: {JSON.stringify(error)}
          </Typography>
        </Grid>
      )}

      {/* Create Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={handleCloseModals}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t(
            "admin.attributes.createDefinition",
            "Create Attribute Definition",
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t("admin.attributes.attributeName", "Attribute Name")}
              value={formData.attribute_name}
              onChange={(e) =>
                setFormData({ ...formData, attribute_name: e.target.value })
              }
              sx={{ mb: 2 }}
              helperText={t(
                "admin.attributes.attributeNameHelp",
                "Internal name (e.g., 'size', 'class')",
              )}
            />
            <TextField
              fullWidth
              label={t("admin.attributes.displayName", "Display Name")}
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              sx={{ mb: 2 }}
              helperText={t(
                "admin.attributes.displayNameHelp",
                "User-facing name (e.g., 'Component Size', 'Component Class')",
              )}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {t("admin.attributes.field.attributeType", "Attribute Type")}
              </InputLabel>
              <Select
                value={formData.attribute_type}
                label={t(
                  "admin.attributes.field.attributeType",
                  "Attribute Type",
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attribute_type: e.target.value as any,
                  })
                }
              >
                <MenuItem value="select">Select (single value)</MenuItem>
                <MenuItem value="multiselect">
                  Multiselect (multiple values)
                </MenuItem>
                <MenuItem value="range">Range (min/max)</MenuItem>
                <MenuItem value="text">Text (free-form)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t("admin.attributes.allowedValues", "Allowed Values")}
              value={allowedValuesInput}
              onChange={(e) => setAllowedValuesInput(e.target.value)}
              sx={{ mb: 2 }}
              helperText={t(
                "admin.attributes.allowedValuesHelp",
                "Comma-separated values (leave empty for any value)",
              )}
              placeholder="Military, Stealth, Industrial, Civilian"
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.applicable_item_types || []}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  applicable_item_types: newValue.length > 0 ? newValue : null,
                })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(
                    "admin.attributes.applicableTypes",
                    "Applicable Item Types",
                  )}
                  helperText={t(
                    "admin.attributes.applicableTypesHelp",
                    "Leave empty for all types, or specify types (e.g., 'Quantum Drive', 'Cooler')",
                  )}
                />
              )}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label={t("admin.attributes.order", "Display Order")}
              value={formData.display_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: parseInt(e.target.value) || 0,
                })
              }
              helperText={t(
                "admin.attributes.orderHelp",
                "Lower numbers appear first",
              )}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <input
                  type="checkbox"
                  id="show-in-filters"
                  checked={formData.show_in_filters || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      show_in_filters: e.target.checked,
                    })
                  }
                />
                <label htmlFor="show-in-filters">
                  {t(
                    "admin.attributes.showInFilters",
                    "Show in market filters",
                  )}
                </label>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleCreateDefinition}
            variant="contained"
            disabled={
              isCreating ||
              !formData.attribute_name ||
              !formData.display_name ||
              !formData.attribute_type
            }
          >
            {isCreating
              ? t("admin.attributes.creating", "Creating...")
              : t("admin.attributes.create", "Create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseModals}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("admin.attributes.editDefinition", "Edit Attribute Definition")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t("admin.attributes.attributeName", "Attribute Name")}
              value={formData.attribute_name}
              disabled
              sx={{ mb: 2 }}
              helperText={t(
                "admin.attributes.attributeNameReadonly",
                "Attribute name cannot be changed",
              )}
            />
            <TextField
              fullWidth
              label={t("admin.attributes.displayName", "Display Name")}
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {t("admin.attributes.field.attributeType", "Attribute Type")}
              </InputLabel>
              <Select
                value={formData.attribute_type}
                label={t(
                  "admin.attributes.field.attributeType",
                  "Attribute Type",
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attribute_type: e.target.value as any,
                  })
                }
              >
                <MenuItem value="select">Select (single value)</MenuItem>
                <MenuItem value="multiselect">
                  Multiselect (multiple values)
                </MenuItem>
                <MenuItem value="range">Range (min/max)</MenuItem>
                <MenuItem value="text">Text (free-form)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t("admin.attributes.allowedValues", "Allowed Values")}
              value={allowedValuesInput}
              onChange={(e) => setAllowedValuesInput(e.target.value)}
              sx={{ mb: 2 }}
              helperText={t(
                "admin.attributes.allowedValuesHelp",
                "Comma-separated values (leave empty for any value)",
              )}
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.applicable_item_types || []}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  applicable_item_types: newValue.length > 0 ? newValue : null,
                })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(
                    "admin.attributes.applicableTypes",
                    "Applicable Item Types",
                  )}
                />
              )}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label={t("admin.attributes.order", "Display Order")}
              value={formData.display_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: parseInt(e.target.value) || 0,
                })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <input
                  type="checkbox"
                  id="edit-show-in-filters"
                  checked={formData.show_in_filters || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      show_in_filters: e.target.checked,
                    })
                  }
                />
                <label htmlFor="edit-show-in-filters">
                  {t(
                    "admin.attributes.showInFilters",
                    "Show in market filters",
                  )}
                </label>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleUpdateDefinition}
            variant="contained"
            disabled={
              isUpdating || !formData.display_name || !formData.attribute_type
            }
          >
            {isUpdating
              ? t("admin.attributes.updating", "Updating...")
              : t("admin.attributes.update", "Update")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={handleCloseModals}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t(
            "admin.attributes.deleteDefinition",
            "Delete Attribute Definition",
          )}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t(
              "admin.attributes.deleteConfirm",
              "Are you sure you want to delete this attribute definition?",
            )}
          </Typography>
          {selectedDefinition && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "grey.100",
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <Typography variant="h6">
                {selectedDefinition.display_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDefinition.attribute_name}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset">
              <Typography variant="body2" sx={{ mb: 1 }}>
                {t(
                  "admin.attributes.cascadeOption",
                  "Also delete all game item attributes with this name?",
                )}
              </Typography>
              <Select
                value={cascadeDelete ? "yes" : "no"}
                onChange={(e) => setCascadeDelete(e.target.value === "yes")}
                size="small"
              >
                <MenuItem value="no">
                  {t("admin.attributes.keepAttributes", "Keep attributes")}
                </MenuItem>
                <MenuItem value="yes">
                  {t("admin.attributes.deleteAttributes", "Delete attributes")}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleDeleteDefinition}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting
              ? t("admin.attributes.deleting", "Deleting...")
              : t("admin.attributes.delete", "Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
