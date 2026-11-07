import { useTranslation } from "react-i18next"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material"
import type { AttributeDefinition } from "../../store/api/attributes"
import type { useAdminAttributeDefinitions } from "../../features/admin/hooks/useAdminAttributeDefinitions"

type AdminAttributeDefinitions = ReturnType<typeof useAdminAttributeDefinitions>

/** Create dialog for a new attribute definition. */
export function CreateAttributeDefinitionDialog({
  defs,
}: {
  defs: AdminAttributeDefinitions
}) {
  const { t } = useTranslation()
  const {
    isCreateModalOpen,
    handleCloseModals,
    formData,
    setFormData,
    allowedValuesInput,
    setAllowedValuesInput,
    isCreating,
    handleCreateDefinition,
  } = defs
  return (
    <Dialog
      open={isCreateModalOpen}
      onClose={handleCloseModals}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {t("admin.attributes.createDefinition", "Create Attribute Definition")}
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
            <InputLabel id="admin-attribute-definitions-attribute-type-label">
              {t("admin.attributes.field.attributeType", "Attribute Type")}
            </InputLabel>
            <Select
              labelId="admin-attribute-definitions-attribute-type-label"
              value={formData.attribute_type}
              label={t(
                "admin.attributes.field.attributeType",
                "Attribute Type",
              )}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attribute_type: e.target
                    .value as AttributeDefinition["attribute_type"],
                })
              }
            >
              <MenuItem value="select">
                {t("adminUi.attributes.types.select")}
              </MenuItem>
              <MenuItem value="multiselect">
                {t("adminUi.attributes.types.multiselect")}
              </MenuItem>
              <MenuItem value="range">
                {t("adminUi.attributes.types.range")}
              </MenuItem>
              <MenuItem value="text">
                {t("adminUi.attributes.types.text")}
              </MenuItem>
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
            placeholder={t("adminUi.attributes.allowedValuesPlaceholder")}
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
                {t("admin.attributes.showInFilters", "Show in market filters")}
              </label>
            </Box>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModals}>{t("common.cancel")}</Button>
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
  )
}

/** Edit dialog for an existing attribute definition. */
export function EditAttributeDefinitionDialog({
  defs,
}: {
  defs: AdminAttributeDefinitions
}) {
  const { t } = useTranslation()
  const {
    isEditModalOpen,
    handleCloseModals,
    formData,
    setFormData,
    allowedValuesInput,
    setAllowedValuesInput,
    isUpdating,
    handleUpdateDefinition,
  } = defs
  return (
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
            <InputLabel id="admin-attribute-definitions-attribute-type-2-label">
              {t("admin.attributes.field.attributeType", "Attribute Type")}
            </InputLabel>
            <Select
              labelId="admin-attribute-definitions-attribute-type-2-label"
              value={formData.attribute_type}
              label={t(
                "admin.attributes.field.attributeType",
                "Attribute Type",
              )}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attribute_type: e.target
                    .value as AttributeDefinition["attribute_type"],
                })
              }
            >
              <MenuItem value="select">
                {t("adminUi.attributes.types.select")}
              </MenuItem>
              <MenuItem value="multiselect">
                {t("adminUi.attributes.types.multiselect")}
              </MenuItem>
              <MenuItem value="range">
                {t("adminUi.attributes.types.range")}
              </MenuItem>
              <MenuItem value="text">
                {t("adminUi.attributes.types.text")}
              </MenuItem>
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
                {t("admin.attributes.showInFilters", "Show in market filters")}
              </label>
            </Box>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModals}>{t("common.cancel")}</Button>
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
  )
}
