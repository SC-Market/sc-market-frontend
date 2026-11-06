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
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material"
import {
  useGetGameItemAttributesQuery,
  useGetAttributeDefinitionsQuery,
  GameItemAttribute,
  UpsertGameItemAttributePayload,
} from "../../store/api/attributes"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useGameItemAttributeActions } from "../../features/admin/hooks/useGameItemAttributeActions"
import { AdminIcons } from "../../components/icons"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useFormatters } from "../../util/format"
import { GameItemAttributeFormDialog } from "./GameItemAttributeFormDialog"

interface AdminGameItemAttributesViewProps {
  gameItemId: string
  gameItemName?: string
}

export function AdminGameItemAttributesView({
  gameItemId,
  gameItemName,
}: AdminGameItemAttributesViewProps) {
  const fmt = useFormatters()
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

  const {
    upsert,
    remove,
    importFromGameData,
    isUpserting,
    isDeleting,
    isImporting,
  } = useGameItemAttributeActions(gameItemId)

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

  const handleUpsertAttribute = async () => {
    if (await upsert(formData)) handleCloseModals()
  }

  const handleDeleteAttribute = async () => {
    if (!selectedAttribute) return
    if (await remove(selectedAttribute.attribute_name)) handleCloseModals()
  }

  const handleImportAttributes = importFromGameData

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
        <Chip
          label={params.value}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "updated_at",
      headerName: t("admin.gameItemAttributes.updated", "Last Updated"),
      width: 150,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{fmt.dateTime(params.value)}</Typography>
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

  const rows = React.useMemo(() => {
    if (!attributesData?.attributes) return []
    return attributesData.attributes.map((attr) => ({
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
              isImporting ? (
                <CircularProgress size={16} />
              ) : (
                <AdminIcons.CloudDownload />
              )
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
            startIcon={<AdminIcons.Add />}
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
            {t("adminUi.gameItemAttributes.loadError", {
              error: JSON.stringify(error),
            })}
          </Typography>
        </Grid>
      )}

      {/* Create/Edit Modal */}
      <GameItemAttributeFormDialog
        open={isCreateModalOpen || isEditModalOpen}
        isEdit={isEditModalOpen}
        formData={formData}
        setFormData={setFormData}
        definitions={definitionsData?.definitions}
        isUpserting={isUpserting}
        onClose={handleCloseModals}
        onSave={handleUpsertAttribute}
      />

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
                {selectedAttribute.display_name ||
                  selectedAttribute.attribute_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAttribute.attribute_value}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>{t("common.cancel")}</Button>
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
