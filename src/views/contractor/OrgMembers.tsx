import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import SearchIcon from "@mui/icons-material/SearchRounded"
import { Stack } from "@mui/system"
import { BACKEND_URL } from "../../util/constants"
import { Section } from "../../components/paper/Section"
import {
  Button,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { Contractor } from "../../features/contractor/domain/types"
import { useGetContractorMembersQuery } from "../../features/contractor/api/contractorApi"
import { MEMBER_LIST_PAGE_SIZE } from "../../features/contractor/domain/constants"
import { NumberedPagination } from "../../components/pagination/NumberedPagination"
import { PeopleRow, headCells } from "./OrgMemberRow"

export function MemberList(props: { contractor: Contractor }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(MEMBER_LIST_PAGE_SIZE)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("any")

  // Use server-side pagination
  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: props.contractor?.spectrum_id || "",
    page,
    page_size: pageSize,
    search: searchQuery,
    role_filter: roleFilter === "any" ? "" : roleFilter,
    sort: "username",
  })

  const members = membersData?.members || []
  const total = membersData?.total || 0

  // Handle page changes for server-side pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (rowsPerPage: number) => {
    setPageSize(rowsPerPage)
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
          // a full row of its own on a phone (Section wraps it under the title)
          sx={{ flex: { xs: "1 1 100%", sm: "0 1 auto" } }}
        >
          <TextField
            label={t("manageMemberList.search")}
            size="small"
            sx={{ flex: { xs: 1, sm: "0 1 auto" } }}
            InputProps={{
              endAdornment: (
                <IconButton aria-label={t("manageMemberList.search")}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
            value={searchQuery}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(event.target.value)
              setPage(0)
            }}
          />
          <TextField
            select
            label={t("manageMemberList.role")}
            sx={{ minWidth: { xs: 120, sm: 0 } }}
            value={roleFilter}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setRoleFilter(event.target.value)
              setPage(0)
            }}
            size="small"
            defaultValue="any"
          >
            <MenuItem value="any">{t("manageMemberList.any")}</MenuItem>
            {(props.contractor?.roles || []).map((r) => (
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
              {headCells.map((cell, i) => (
                <TableCell
                  // two head cells share the id "username"
                  key={`${String(cell.id)}-${i}`}
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
        <NumberedPagination
          count={total}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[25, 50, 100]}
          onRowsPerPageChange={handlePageSizeChange}
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
  const { data: membersData } = useGetContractorMembersQuery({
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
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (rowsPerPage: number) => {
    setPageSize(rowsPerPage)
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
                <IconButton aria-label={t("manageMemberList.search")}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
            sx={{ marginRight: 1 }}
            value={searchQuery}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(event.target.value)
              setPage(0) // Reset to first page when searching
            }}
          />
          <TextField
            select
            label={t("manageMemberList.role")}
            value={roleFilter}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
              {headCells.map((cell, i) => (
                <TableCell
                  // two head cells share the id "username"
                  key={`${String(cell.id)}-${i}`}
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
        <NumberedPagination
          count={total}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[25, 50, 100]}
          onRowsPerPageChange={handlePageSizeChange}
        />
      </Grid>
    </Section>
  )
}
