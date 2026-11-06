import React from "react"
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Button,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { contractorKindIcons, contractorKindIconsKeys } from "./ContractorList"
import type { ContractorKindIconKey } from "../../features/contractor/domain/types"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { Contractor } from "../../features/contractor/domain/types"
import { EditRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useOrgDetailEdit } from "../../features/contractor/hooks/useOrgDetailEdit"

type OrgTagsEditorProps = Pick<
  ReturnType<typeof useOrgDetailEdit>,
  "editingTags" | "setEditingTags" | "newTags" | "setNewTags" | "submitUpdate"
> & { contractor: Contractor }

/** The org's tag chips, with an inline editor to change them. */
export function OrgTagsEditor({
  contractor,
  editingTags,
  setEditingTags,
  newTags,
  setNewTags,
  submitUpdate,
}: OrgTagsEditorProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  return (
    <>
      {editingTags ? (
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            padding: { xs: 1, sm: 1.5 },
          }}
        >
          <Autocomplete
            fullWidth
            multiple
            filterSelectedOptions
            value={newTags}
            onChange={(_event: React.SyntheticEvent, newValue) => {
              setNewTags(newValue || [])
            }}
            options={contractorKindIconsKeys}
            defaultValue={
              [
                ...(contractor?.fields as ContractorKindIconKey[]),
              ] /* I don't know why it needs this dumb thing, but the types error without */
            }
            renderInput={(params: AutocompleteRenderInputParams) => (
              <TextField
                {...params}
                variant="outlined"
                label={t("orgDetailEdit.org_tags")}
                placeholder={t("orgDetailEdit.mining")}
                fullWidth
                SelectProps={{
                  IconComponent: KeyboardArrowDownRoundedIcon,
                }}
                aria-label={t(
                  "accessibility.orgTagsInput",
                  "Select organization tags",
                )}
                aria-describedby="org-tags-help"
              />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                // eslint-disable-next-line react/jsx-key
                <Chip
                  color={"primary"}
                  label={option}
                  sx={{ marginRight: 1, textTransform: "capitalize" }}
                  variant={"outlined"}
                  icon={contractorKindIcons[option]}
                  {...getTagProps({ index })}
                />
              ))
            }
            // getOptionLabel={option => <span style={{textTransform: 'capitalize'}}>{option}</span>}
          />
          <Button
            sx={{ marginLeft: 2 }}
            variant={"contained"}
            onClick={async () => {
              if (editingTags && newTags) {
                await submitUpdate({ tags: newTags })
              }
              setEditingTags((v) => !v)
            }}
            aria-label={t(
              "accessibility.saveOrgTags",
              "Save organization tags",
            )}
            aria-describedby="save-org-tags-help"
          >
            {t("orgDetailEdit.save")}
            <span id="save-org-tags-help" className="sr-only">
              {t(
                "accessibility.saveOrgTagsHelp",
                "Save the new organization tags",
              )}
            </span>
          </Button>
        </CardContent>
      ) : (
        <CardActions sx={{ overflow: "scroll", padding: { xs: 1, sm: 1.5 } }}>
          {contractor.fields.length ? (
            contractor?.fields.map((option, index) => (
              <Chip
                color={"primary"}
                label={option}
                sx={{ marginRight: 1, textTransform: "capitalize" }}
                variant={"outlined"}
                icon={contractorKindIcons[option]}
                key={index}
              />
            ))
          ) : (
            <Typography>{t("orgDetailEdit.no_tags")}</Typography>
          )}
          <IconButton
            aria-label={t("orgDetailEdit.editTags", "Edit tags")}
            sx={{
              // position: 'absolute',
              zIndex: 50,
              transition: "0.3s",
              color: theme.palette.background.light,
              // top: 20,
              // left: 20
            }}
            onClick={() => setEditingTags(true)}
          >
            <EditRounded />
          </IconButton>
        </CardActions>
      )}
    </>
  )
}
