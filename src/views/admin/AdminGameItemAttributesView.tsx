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
  Alert,
  CircularProgress,
} from "@mui/material"
import {
  useGetGameItemAttributesQuery,
  useUpsertGameItemAttributeMutation,
  useDeleteGameItemAttributeMutation,
  useImportGameItemAttributesMutation,
  useGetAttributeDefinitionsQuery,
  GameItemAttribute,
  UpsertGameItemAttributePayload,
} from "../../store/api/attributes"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import AddIcon from "@mui/icons-material/AddRounded"
import EditIcon from "@mui/icons-material/EditRounded"
import DeleteIcon from "@mui/icons-material/DeleteRounded"
import CloudDownloadIcon from "@mui/icons-material/CloudDownloadRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface AdminGameItemAttributesViewProps {
  gameItemId: string
  gameItemName?: string
}

export function AdminGameItemAttributesView({
  gameItemId,
  gameItemName,
}: AdminGameItemAttributesViewProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAttribute, setSelectedAttribute] =
    useState<GameItemAttribute | null>(null)

  const {
    data: attributesData,
    isLoading,
    error,
  } = useGetGameItemAttributesQuery(gameItemId)

  const { data: definitionsData } = useGetAttributeDefinitionsQuery()

  const [upsertAttribute, { isLoading: isUpserting }] =
    useUpsertGameItemAttributeMutation()
  const [deleteAttribute, { isLoading: isDeleting }] =
    useDeleteGameItemAttributeMutation()
  const [importAttributes, { isLoading: isImporting }] =
    useImportGameItemAttributesMutation()

  const issueAlert = useAlertHook()

  // Form state
  const [formData, setFormData] = useState<UpsertGameItemAttributePayload>({
    attribute_name: "",
    attribute_value: "",
  })

  const handleOpenCreateModal = () => {
    setFormData({
      attribute_name: "",
      attribute_value: "",
    })
    setIsCreateModalOpen(true)
  }

  const handleOpenEditModal = (attribute: GameItemAttribute) => {
    setSelectedAttribute(attribute)
    setFormData({
      attribute_name: attribute.attribute_name,
      attribute_value: attribute.attribute_value,
    })
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteModal = (attribute: GameItemAttribute) => {
    setSelectedAttribute(attribute)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedAttribute(null)
    setFormData({
      attribute_name: "",
      attribute_value: "",
    })
  }

  const handleUpsertAttribute = () => {
    upsertAttribute({
      gameItemId,
      data: formData,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t(
            "admin.gameItemAttributes.saved",
            "Attribute saved successfully",
          ),
          severity: "success",
        })
        handleCloseModals()
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const handleDeleteAttribute = () => {
    if (!selectedAttribute) return

    deleteAttribute({
      gameItemId,
      attributeName: selectedAttribute.attribute_name,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t(
            "admin.gameItemAttributes.deleted",
            "Attribute deleted successfully",
          ),
          severity: "success",
        })
        handleCloseModals()
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const handleImportAttributes = () => {
    importAttributes(gameItemId)
      .unwrap()
      .then((result) => {
        if (result.success) {
          issueAlert({
            message: t(
              "admin.gameItemAttributes.importSuccess",
              `Successfully imported ${result.attributesImported} attributes`,
            ),
            severity: "success",
          })
        } else {
          issueAlert({
            message: t(
              "admin.gameItemAttributes.importPartial",
              `Import completed with errors. Imported ${result.attributesImported} attributes`,
            ),
            severity: "warning",
          })
        }
      })
      .catch((error) => {
        issueAlert(error)
      })
  }

  const getSelectedDefinition = () => {
    if (!definitionsData?.definitions || !formData.attribute_name) return null
    return definitionsData.definitions.find(
      (def) => def.attribute_name === formData.attribute_name,
    )
  }

  const selectedDefinition = getSelectedDefinition()

  const columns: GridColDef[] = [
    {
      field: "attribute_name",
      headerName: t("admin.gameItemAttributes.attributeName", "Attribute"),
      width: 150,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">{params.row.display_name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "attribute_value",
      headerName: t("admin.gameItemAttributes.value", "Value"),
      width: 200,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} color="primary" variant="outlined" size="small" />
      ),
    },
    {
      field: "updated_at",
      headerName: t("admin.gameItemAttributes.updated", "Last Updated"),
      width: 150,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("admin.gameItemAttributes.actions", "Actions"),
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
    if (!attributesData?.attributes) return []
    return attributesData.attributes.map((attr, index) => ({
      ...attr,
      id: `${attr.game_item_id}-${attr.attribute_name}`,
    }))
  }, [attributesData?.attributes])

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
          {t("admin.gameItemAttributes.title", "Game Item Attributes")}
          {gameItemName && (
            <Typography variant="body2" color="text.secondary">
              {gameItemName}
            </Typography>
          )}
        </HeaderTitle>
        <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
          <Button
            variant="outlined"
            startIcon={
              isImporting ? <CircularProgress size={16} /> : <CloudDownloadIcon />
            }
            onClick={handleImportAttributes}
            disabled={isImporting}
            sx={{ mr: 1 }}
          >
            {isImporting
              ? t("admin.gameItemAttributes.importing", "Importing...")
              : t("admin.gameItemAttributes.import", "Import from External")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
          >
            {t("admin.gameItemAttributes.add", "Add Attribute")}
          </Button>
        </Grid>
      </Grid>

      {attributesData && (
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
            Error loading attributes: {JSON.stringify(error)}
          </Typography>
        </Grid>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={isCreateModalOpen || isEditModalOpen}
        onClose={handleCloseModals}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isCreateModalOpen
            ? t("admin.gameItemAttributes.addAttribute", "Add Attribute")
            : t("admin.gameItemAttributes.editAttribute", "Edit Attribute")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {t("admin.gameItemAttributes.attributeName", "Attribute")}
              </InputLabel>
              <Select
                value={formData.attribute_name}
                label={t("admin.gameItemAttributes.attributeName", "Attribute")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attribute_name: e.target.value,
                    attribute_value: "", // Reset value when attribute changes
                  })
                }
                disabled={isEditModalOpen} // Can't change attribute name when editing
              >
                {definitionsData?.definitions.map((def) => (
                  <MenuItem key={def.attribute_name} value={def.attribute_name}>
                    {def.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedDefinition?.allowed_values &&
            selectedDefinition.allowed_values.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel>
                  {t("admin.gameItemAttributes.value", "Value")}
                </InputLabel>
                <Select
                  value={formData.attribute_value}
                  label={t("admin.gameItemAttributes.value", "Value")}
                  onChange={(e) =>
                    setFormData({ ...formData, attribute_value: e.target.value })
                  }
                >
                  {selectedDefinition.allowed_values.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label={t("admin.gameItemAttributes.value", "Value")}
                value={formData.attribute_value}
                onChange={(e) =>
                  setFormData({ ...formData, attribute_value: e.target.value })
                }
                helperText={
                  selectedDefinition
                    ? t(
                        "admin.gameItemAttributes.freeFormValue",
                        "Enter any value",
                      )
                    : t(
                        "admin.gameItemAttributes.selectAttribute",
                        "Select an attribute first",
                      )
                }
              />
            )}

            {selectedDefinition && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedDefinition.attribute_type}
                </Typography>
                <Typography variant="body2">
                  <strong>Applicable to:</strong>{" "}
                  {selectedDefinition.applicable_item_types && selectedDefinition.applicable_item_types.length > 0
                    ? selectedDefinition.applicable_item_types.join(", ")
                    : "No types"}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleUpsertAttribute}
            variant="contained"
            disabled={
              isUpserting ||
              !formData.attribute_name ||
              !formData.attribute_value
            }
          >
            {isUpserting
              ? t("admin.gameItemAttributes.saving", "Saving...")
              : t("admin.gameItemAttributes.save", "Save")}
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
          {t("admin.gameItemAttributes.deleteAttribute", "Delete Attribute")}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t(
              "admin.gameItemAttributes.deleteConfirm",
              "Are you sure you want to delete this attribute?",
            )}
          </Typography>
          {selectedAttribute && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "grey.100",
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <Typography variant="h6">
                {selectedAttribute.display_name || selectedAttribute.attribute_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAttribute.attribute_value}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            onClick={handleDeleteAttribute}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting
              ? t("admin.gameItemAttributes.deleting", "Deleting...")
              : t("admin.gameItemAttributes.delete", "Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
