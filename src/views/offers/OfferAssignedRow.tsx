import type { GetOfferSessionV2Response } from "../../store/api/v2/market"
import {
  TableCell,
  TableRow,
  Typography,
  Autocomplete,
  TextField,
  Box,
  Button,
} from "@mui/material"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"
import React from "react"
import { UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import type { OfferDetailsState } from "../../features/offers/hooks/useOfferDetails"

/** Assigned-member row of the offer details table, with the assign dialog. */
export function OfferAssignedRow({
  session,
  details,
}: {
  session: GetOfferSessionV2Response
  details: OfferDetailsState
}) {
  const { t } = useTranslation()
  const {
    isEditingAssigned,
    setIsEditingAssigned,
    target,
    setTarget,
    targetObject,
    setTargetObject,
    options,
    members,
    handleAssignSave,
    handleAssignCancel,
    handleUnassign,
    handleClaimOffer,
    actions,
  } = details
  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell component="th" scope="row">
        <Stack direction="row" alignItems="center" spacing={1}>
          {t("orderDetailsArea.assigned", "Assigned")}
          {actions.canAssign && (
            <Button
              size="small"
              variant="text"
              onClick={() => setIsEditingAssigned(!isEditingAssigned)}
              sx={{ textTransform: "none", fontSize: "0.75rem" }}
            >
              {isEditingAssigned
                ? t("common.cancel")
                : t("memberAssignArea.assign")}
            </Button>
          )}
        </Stack>
      </TableCell>
      <TableCell align="right">
        <Stack
          direction="row"
          justifyContent="right"
          alignItems="center"
          spacing={1}
        >
          {session.assigned_to ? (
            <Stack direction="column">
              <UserDetails user={session.assigned_to} />
            </Stack>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                {t("orderDetailsArea.none", "None")}
              </Typography>
              {actions.canClaim && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleClaimOffer}
                >
                  {t("orderDetailsArea.claim", "Claim")}
                </Button>
              )}
            </>
          )}
        </Stack>

        {/* Assign Member Dialog */}
        <ResponsiveDialog
          open={isEditingAssigned}
          onClose={handleAssignCancel}
          title={t("memberAssignArea.assignMember", "Assign Member")}
          maxWidth="xs"
          actions={
            <>
              {session.assigned_to && (
                <Button color="error" onClick={handleUnassign}>
                  {t("memberAssignArea.unassign", "Unassign")}
                </Button>
              )}
              <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />
              <Button onClick={handleAssignCancel}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={handleAssignSave}
                disabled={!targetObject}
              >
                {t("common.save", "Save")}
              </Button>
            </>
          }
        >
          <Autocomplete
            filterOptions={(x) => x}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            options={
              target
                ? options
                : members
                    .map((u) => ({
                      username: u.username,
                      display_name: u.username,
                    }))
                    .slice(0, 8)
            }
            getOptionLabel={(option) =>
              `${option.username} (${option.display_name})`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("memberAssignArea.handle")}
                SelectProps={{
                  IconComponent: KeyboardArrowDownRoundedIcon,
                }}
              />
            )}
            value={targetObject}
            onChange={(_event: React.SyntheticEvent, newValue) => {
              setTargetObject(newValue)
            }}
            inputValue={target}
            onInputChange={(_event, newInputValue) => {
              setTarget(newInputValue)
            }}
          />
        </ResponsiveDialog>
      </TableCell>
    </TableRow>
  )
}
