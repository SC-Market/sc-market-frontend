import { useTranslation } from "react-i18next"
import {
  Typography,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material"
import {
  AttributeDefinition,
  UpsertGameItemAttributePayload,
} from "../../store/api/attributes"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

/** Add/edit dialog for one game item attribute. */
export function GameItemAttributeFormDialog({
  open,
  isEdit,
  formData,
  setFormData,
  definitions,
  isUpserting,
  onClose,
  onSave,
}: {
  open: boolean
  isEdit: boolean
  formData: UpsertGameItemAttributePayload
  setFormData: (data: UpsertGameItemAttributePayload) => void
  definitions: AttributeDefinition[] | undefined
  isUpserting: boolean
  onClose: () => void
  onSave: () => void
}) {
  const { t } = useTranslation()
  const selectedDefinition =
    definitions && formData.attribute_name
      ? definitions.find(
          (def) => def.attribute_name === formData.attribute_name,
        )
      : null
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={
        !isEdit
          ? t("admin.gameItemAttributes.addAttribute", "Add Attribute")
          : t("admin.gameItemAttributes.editAttribute", "Edit Attribute")
      }
      actions={
        <>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            onClick={onSave}
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
        </>
      }
    >
      <Box sx={{ mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="admin-game-item-attributes-attribute-label">
            {t("admin.gameItemAttributes.attributeName", "Attribute")}
          </InputLabel>
          <Select
            labelId="admin-game-item-attributes-attribute-label"
            value={formData.attribute_name}
            label={t("admin.gameItemAttributes.attributeName", "Attribute")}
            onChange={(e) =>
              setFormData({
                ...formData,
                attribute_name: e.target.value,
                attribute_value: "", // Reset value when attribute changes
              })
            }
            disabled={isEdit} // Can't change attribute name when editing
          >
            {definitions?.map((def) => (
              <MenuItem key={def.attribute_name} value={def.attribute_name}>
                {def.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedDefinition?.allowed_values &&
        selectedDefinition.allowed_values.length > 0 ? (
          <FormControl fullWidth>
            <InputLabel id="admin-game-item-attributes-value-label">
              {t("admin.gameItemAttributes.value", "Value")}
            </InputLabel>
            <Select
              labelId="admin-game-item-attributes-value-label"
              value={formData.attribute_value}
              label={t("admin.gameItemAttributes.value", "Value")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attribute_value: e.target.value,
                })
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
                ? t("admin.gameItemAttributes.freeFormValue", "Enter any value")
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
              <strong>{t("adminUi.gameItemAttributes.typeLabel")}</strong>{" "}
              {selectedDefinition.attribute_type}
            </Typography>
            <Typography variant="body2">
              <strong>{t("adminUi.gameItemAttributes.applicableTo")}</strong>{" "}
              {selectedDefinition.applicable_item_types &&
              selectedDefinition.applicable_item_types.length > 0
                ? selectedDefinition.applicable_item_types.join(", ")
                : t("adminUi.gameItemAttributes.noTypes")}
            </Typography>
          </Alert>
        )}
      </Box>
    </ResponsiveDialog>
  )
}
