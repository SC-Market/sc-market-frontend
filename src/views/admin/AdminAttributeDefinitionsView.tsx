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
  Box,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { AdminIcons } from "../../components/icons"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useAdminAttributeDefinitions } from "../../features/admin/hooks/useAdminAttributeDefinitions"
import {
  CreateAttributeDefinitionDialog,
  EditAttributeDefinitionDialog,
} from "./AttributeDefinitionFormDialogs"

export function AdminAttributeDefinitionsView() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const defs = useAdminAttributeDefinitions()
  const {
    definitionsData,
    isLoading,
    error,
    rows,
    selectedDefinition,
    isDeleteModalOpen,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleCloseModals,
    cascadeDelete,
    setCascadeDelete,
    isDeleting,
    handleDeleteDefinition,
  } = defs

  const columns: GridColDef[] = [
    {
      field: "attribute_name",
      headerName: t("admin.attributes.attributeName", "Attribute Name"),
      width: 150,
      display: "flex" as const,
      flex: 1,
    },
    {
      field: "display_name",
      headerName: t("admin.attributes.displayName", "Display Name"),
      width: 150,
      display: "flex" as const,
      flex: 1,
    },
    {
      field: "attribute_type",
      headerName: t("admin.attributes.field.type", "Type"),
      width: 120,
      display: "flex" as const,
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
      display: "flex" as const,
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
      display: "flex" as const,
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
      display: "flex" as const,
      flex: 1,
    },
    {
      field: "actions",
      headerName: t("admin.attributes.actions", "Actions"),
      width: 150,
      display: "flex" as const,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenEditModal(params.row)}
            color="primary"
            aria-label={t("accessibility.edit")}
          >
            <AdminIcons.Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDeleteModal(params.row)}
            color="error"
            aria-label={t("accessibility.delete")}
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
          {t("admin.attributes.title", "Attribute Definitions")}
        </HeaderTitle>
        <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
          <Button
            variant="contained"
            startIcon={<AdminIcons.Add />}
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
            {t("adminUi.attributes.loadError", {
              error: JSON.stringify(error),
            })}
          </Typography>
        </Grid>
      )}

      <CreateAttributeDefinitionDialog defs={defs} />

      {/* Edit Modal */}
      <EditAttributeDefinitionDialog defs={defs} />

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
                inputProps={{
                  "aria-label": t("adminUi.attributes.cascadeDelete"),
                }}
                SelectDisplayProps={{
                  "aria-label": t("adminUi.attributes.cascadeDelete"),
                }}
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
          <Button onClick={handleCloseModals}>{t("common.cancel")}</Button>
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
