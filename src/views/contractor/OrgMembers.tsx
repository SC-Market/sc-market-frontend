import React, { MouseEventHandler, useCallback, useMemo, useState } from "react"
import { Section } from "../../components/paper/Section"
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material"
import { Link } from "react-router-dom"
import { HeadCell } from "../../components/table/PaginatedTable"
import { useGetUserProfileQuery } from "../../store/profile"
import { MinimalUser } from "../../datatypes/User"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useApplyContractorRoleMutation,
  useKickContractorMemberMutation,
  useRemoveContractorRoleMutation,
  useGetContractorMembersQuery,
} from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { has_permission, min_position, getMemberPosition } from "./OrgRoles"
import { Contractor, ContractorRole } from "../../datatypes/Contractor"
import SearchIcon from "@mui/icons-material/Search"
import { Stack } from "@mui/system"
import { BACKEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

function PeopleRow(props: {
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

  const [roles, setRoles] = useState(row.roles)

  const [applyRole] = useApplyContractorRoleMutation()
  const [removeRole] = useRemoveContractorRoleMutation()
  const [kickMember] = useKickContractorMemberMutation()
  const issueAlert = useAlertHook()

  const { data: profile } = useGetUserProfileQuery()
  const myPosition = useMemo(
    () => min_position(contractor, profile!, profile?.contractors),
    [contractor, profile],
  )
  const theirPosition = useMemo(
    () => getMemberPosition(contractor, row.roles),
    [contractor, row.roles],
  )
  const canKick = useMemo(
    () =>
      has_permission(contractor, profile, "kick_members", profile?.contractors),
    [contractor, profile],
  )

  const addRoleCallback = useCallback(
    (role_id: string) => {
      applyRole({
        contractor: contractor!.spectrum_id,
        username: row.username,
        role_id,
      })
        .unwrap()
        .then(() => {
          issueAlert({
            message: t("manageMemberList.updated"),
            severity: "success",
          })
        })
        .catch((error) => {
          issueAlert(error)
        })
    },
    [contractor, row.username, issueAlert, applyRole, t],
  )

  const removeRoleCallback = useCallback(
    (role_id: string) => {
      removeRole({
        contractor: contractor.spectrum_id,
        username: row.username,
        role_id,
      })
        .unwrap()
        .then(() => {
          issueAlert({
            message: t("manageMemberList.updated"),
            severity: "success",
          })
        })
        .catch((error) => {
          issueAlert(error)
        })
    },
    [contractor, row.username, issueAlert, removeRole, t],
  )

  const kickMemberCallback = useCallback(() => {
    kickMember({
      contractor: contractor.spectrum_id,
      username: row.username,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("manageMemberList.member_kicked"),
          severity: "success",
        })
      })
      .catch((error) => {
        issueAlert(error)
      })
  }, [contractor, row.username, issueAlert, kickMember, t])

  return (
    <TableRow
      hover
      onClick={onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.username}
      selected={isItemSelected}
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
            <Link to={`/user/${row.username}`}>
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
                onClick={kickMemberCallback}
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
                />
              )}
              options={(contractor?.roles || []).filter(
                (r) => myPosition < r.position,
              )}
              getOptionLabel={(role) => role.name}
              onChange={(event: any, newValue) => {
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
              value={row.roles.map(
                (rowRole) =>
                  contractor?.roles!.find((r) => rowRole === r.role_id)!,
              )}
              renderTags={(value: readonly ContractorRole[], getTagProps) =>
                value.map((option: ContractorRole, index: number) => (
                  <Chip
                    variant="filled"
                    label={option.name}
                    {...getTagProps({ index })}
                    color={"secondary"}
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

interface OrgMember extends MinimalUser {
  roles: string[]
}

const headCells: readonly HeadCell<OrgMember>[] = [
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

export function MemberList(props: { contractor: Contractor }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  // Use server-side pagination
  const { data: membersData, isLoading } = useGetContractorMembersQuery({
    spectrum_id: props.contractor?.spectrum_id || "",
    page,
    page_size: pageSize,
    search: "",
    role_filter: "",
    sort: "username",
  })

  const members = membersData?.members || []
  const total = membersData?.total || 0

  // Handle page changes for server-side pagination
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Section xs={12} title={t("manageMemberList.members")} disablePadding>
      <Grid item xs={12}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id as string}
                  align={cell.numeric ? "right" : "left"}
                  padding={cell.disablePadding ? "none" : "normal"}
                >
                  {t(cell.label, cell.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member, index) => (
              <PeopleRow
                key={member.username}
                row={member}
                index={index}
                isItemSelected={false}
                labelId={`enhanced-table-checkbox-${index}`}
                contractor={props.contractor}
              />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Grid>
    </Section>
  )
}

export function ManageMemberList() {
  const theme = useTheme<ExtendedTheme>()
  const [contractor] = useCurrentOrg()
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("any")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  // Use the new paginated endpoint with server-side pagination
  const { data: membersData, isLoading } = useGetContractorMembersQuery({
    spectrum_id: contractor?.spectrum_id || "",
    page,
    page_size: pageSize,
    search: searchQuery,
    role_filter: roleFilter === "any" ? "" : roleFilter,
    sort: "username",
  })

  const members = membersData?.members || []
  const total = membersData?.total || 0

  // Handle page changes for server-side pagination
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Section
      xs={12}
      title={t("manageMemberList.members")}
      disablePadding
      subtitle={
        <Stack
          spacing={theme.layoutSpacing.compact}
          direction="row"
          sx={{ minWidth: 100 }}
        >
          <Button
            href={`${BACKEND_URL}/api/contractor/${contractor?.spectrum_id}/members/csv`}
          >
            {t("manageMemberList.export")}
          </Button>
          <TextField
            label={t("manageMemberList.search")}
            size={"small"}
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              ),
            }}
            sx={{ marginRight: 1 }}
            value={searchQuery}
            onChange={(event: any) => {
              setSearchQuery(event.target.value)
              setPage(0) // Reset to first page when searching
            }}
          />
          <TextField
            select
            label={t("manageMemberList.role")}
            value={roleFilter}
            onChange={(event: any) => {
              setRoleFilter(event.target.value)
              setPage(0) // Reset to first page when filtering
            }}
            size={"small"}
            defaultValue={"any"}
          >
            <MenuItem value={"any"}>{t("manageMemberList.any")}</MenuItem>
            {(contractor?.roles || []).map((r) => (
              <MenuItem key={r.role_id} value={r.role_id}>
                {r.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      }
    >
      <Grid item xs={12}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id as string}
                  align={cell.numeric ? "right" : "left"}
                  padding={cell.disablePadding ? "none" : "normal"}
                >
                  {t(cell.label, cell.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member, index) => (
              <PeopleRow
                key={member.username}
                row={member}
                index={index}
                isItemSelected={false}
                labelId={`enhanced-table-checkbox-${index}`}
                manage
                contractor={contractor!}
              />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Grid>
    </Section>
  )
}
