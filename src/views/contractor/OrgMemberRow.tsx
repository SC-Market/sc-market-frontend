import React, { MouseEventHandler } from "react"
import { useTranslation } from "react-i18next"
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { HeadCell } from "../../components/table/PaginatedTable"
import { MinimalUser } from "../../datatypes/User"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import {
  Contractor,
  ContractorRole,
} from "../../features/contractor/domain/types"
import { useMemberActions } from "../../features/contractor/hooks/useMemberActions"
import { USER_PATHS } from "../../routes/paths"

export function PeopleRow(props: {
  row: OrgMember
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
  manage?: boolean
  contractor: Contractor
}) {
  const { row, onClick, isItemSelected, labelId, contractor } = props
  const { t } = useTranslation()

  const {
    myPosition,
    theirPosition,
    canKick,
    addRoleCallback,
    removeRoleCallback,
    kickCallback,
  } = useMemberActions(contractor, row.username, row.roles)
  return (
    <TableRow
      hover
      onClick={onClick}
      tabIndex={-1}
      key={row.username}
      selected={isItemSelected}
      data-testid="org-member-row"
      data-id={row.username}
    >
      {/*<TableCell padding="checkbox">*/}
      {/*    <Checkbox*/}
      {/*        color="primary"*/}
      {/*        checked={isItemSelected}*/}
      {/*        inputProps={{*/}
      {/*            'aria-labelledby': labelId,*/}
      {/*        }}*/}
      {/*    />*/}
      {/*</TableCell>*/}
      <TableCell
        component="th"
        id={labelId}
        scope="row"
        // padding="none"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={row.avatar} />
          <Box>
            <Link to={USER_PATHS.profile(row.username)}>
              <UnderlineLink
                color={"text.secondary"}
                variant={"subtitle1"}
                fontWeight={"bold"}
              >
                {row.username}
              </UnderlineLink>
            </Link>
            <Typography variant={"subtitle2"}>{row.display_name}</Typography>
          </Box>
        </Box>
      </TableCell>
      {props.manage &&
      myPosition !== undefined &&
      myPosition < theirPosition! ? (
        <>
          <TableCell align="right">
            {canKick && (
              <Button
                color={"error"}
                sx={{ marginRight: 2 }}
                onClick={kickCallback}
                aria-label={t("manageMemberList.kickMember", {
                  defaultValue: "Kick {{username}}",
                  username: row.username,
                })}
              >
                {t("manageMemberList.kick")}
              </Button>
            )}
          </TableCell>
          <TableCell align="right">
            <Autocomplete
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={t("manageMemberList.roles")}
                  inputProps={{
                    ...params.inputProps,
                    "aria-label": t("manageMemberList.rolesFor", {
                      defaultValue: "Roles for {{username}}",
                      username: row.username,
                    }),
                  }}
                />
              )}
              options={(contractor?.roles || []).filter(
                (r) => myPosition < r.position,
              )}
              getOptionLabel={(role) => role.name}
              onChange={(_event: React.SyntheticEvent, newValue) => {
                const oldSet = new Set(row.roles)
                const newSet = new Set(newValue.map((r) => r.role_id))

                for (const role_id of oldSet) {
                  if (!newSet.has(role_id)) {
                    removeRoleCallback(role_id)
                  }
                }
                for (const role_id of newSet) {
                  if (!oldSet.has(role_id)) {
                    addRoleCallback(role_id)
                  }
                }
              }}
              value={row.roles.flatMap(
                (rowRole) =>
                  contractor?.roles?.find((r) => rowRole === r.role_id) ?? [],
              )}
              renderTags={(value: readonly ContractorRole[], getTagProps) =>
                value.map((option: ContractorRole, index: number) => (
                  // eslint-disable-next-line react/jsx-key
                  <Chip
                    variant="filled"
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
              multiple
            />
          </TableCell>
        </>
      ) : (
        <>
          <TableCell align={"right"}></TableCell>
          <TableCell align="right">
            <Typography
              variant={"subtitle1"}
              sx={{ textTransform: "capitalize" }}
            >
              {row.roles
                .map(
                  (rowRole) =>
                    contractor!.roles!.find((r) => r.role_id == rowRole)?.name,
                )
                .join(", ")}
            </Typography>
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

export interface OrgMember extends MinimalUser {
  roles: string[]
}

export const headCells: readonly HeadCell<OrgMember>[] = [
  {
    id: "username",
    numeric: false,
    disablePadding: false,
    label: "manageMemberList.username",
  },
  {
    id: "username",
    numeric: true,
    disablePadding: false,
    label: "",
  },
  {
    id: "roles",
    numeric: true,
    disablePadding: false,
    label: "manageMemberList.role",
  },
]
