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
import {
  UserDetails,
  UserDetailsSkeleton,
} from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import type { Order } from "../../features/orders/domain/types"
import { useTranslation } from "react-i18next"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import type { OrderDetailsState } from "../../features/orders/hooks/useOrderDetails"

/** Assigned-member row of the order details table, with the assign dialog. */
export function OrderAssignedRow({
  order,
  details,
}: {
  order: Order
  details: OrderDetailsState
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
    handleClaimOrder,
    assigned,
    assignedLoading,
    roles,
    actions,
  } = details
  return (
    <>
      {/* While the user loads the row holds a same-size placeholder, so
        it doesn't appear or grow when the user arrives. */}
      {(assigned || assignedLoading || roles.orgMember) && (
        <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
          <TableCell component="th" scope="row">
            <Stack direction="row" alignItems="center" spacing={1}>
              {t("orderDetailsArea.assigned")}
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
              {assigned ? (
                <UserDetails user={assigned} />
              ) : assignedLoading ? (
                <UserDetailsSkeleton />
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {t("orderDetailsArea.none", "None")}
                  </Typography>
                  {actions.canClaim && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleClaimOrder}
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
                  {order.assigned_to && (
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
      )}
    </>
  )
}
