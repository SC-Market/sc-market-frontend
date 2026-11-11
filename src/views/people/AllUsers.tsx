import { ReactElement, useState } from "react"
import { Section } from "../../components/paper/Section"
import {
  Grid,
  TableCell,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableSortLabel,
} from "@mui/material"
import {
  useGetAdminUsersQuery,
  useGetAdminActivityQuery,
  useGetAdminMembershipAnalyticsQuery,
  type AdminUser,
} from "../../store/api/v2/market"
import { MuiAreaChart } from "../../components/charts/MuiCharts"
import { useTranslation } from "react-i18next"
import { NumberedPagination } from "../../components/pagination/NumberedPagination"
import { PeopleRow, headCells } from "./AdminPeopleRow"

export function AdminUserList(): ReactElement {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [orderBy, setOrderBy] = useState<keyof AdminUser>("username")
  const [roleFilter, setRoleFilter] = useState<"user" | "admin" | undefined>(
    undefined,
  )
  const [bannedFilter, setBannedFilter] = useState<boolean | undefined>(
    undefined,
  )
  const [rsiFilter, setRsiFilter] = useState<boolean | undefined>(undefined)

  const { data: usersResponse, isLoading } = useGetAdminUsersQuery({
    page,
    pageSize,
    ...(roleFilter && { role: roleFilter }),
    ...(bannedFilter !== undefined && { banned: bannedFilter }),
    ...(rsiFilter !== undefined && { rsiConfirmed: rsiFilter }),
  })

  const handleRequestSort = (property: keyof AdminUser) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const users = usersResponse?.users || []
  const pagination = usersResponse?.pagination

  return (
    <>
      <Section xs={12} title={t("adminUsers.users")}>
        {/* Filters */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
            <InputLabel id="all-users-role-label">
              {t("adminUsers.role")}
            </InputLabel>
            <Select
              labelId="all-users-role-label"
              value={roleFilter || ""}
              label={t("adminUsers.role")}
              onChange={(e) => {
                setRoleFilter(e.target.value as "user" | "admin" | undefined)
                setPage(1) // Reset to first page when filtering
              }}
            >
              <MenuItem value="">{t("adminUsers.all_roles")}</MenuItem>
              <MenuItem value="user">{t("adminUsers.user")}</MenuItem>
              <MenuItem value="admin">{t("adminUsers.admin")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
            <InputLabel id="all-users-banned-status-label">
              {t("adminUsers.banned_status")}
            </InputLabel>
            <Select
              labelId="all-users-banned-status-label"
              value={bannedFilter === undefined ? "" : bannedFilter.toString()}
              label={t("adminUsers.banned_status")}
              onChange={(e) => {
                setBannedFilter(
                  e.target.value === "" ? undefined : e.target.value === "true",
                )
                setPage(1) // Reset to first page when filtering
              }}
            >
              <MenuItem value="">{t("adminUsers.all_users")}</MenuItem>
              <MenuItem value="false">{t("adminUsers.active_users")}</MenuItem>
              <MenuItem value="true">{t("adminUsers.banned_users")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
            <InputLabel id="all-users-verification-label">
              {t("adminUsers.verification")}
            </InputLabel>
            <Select
              labelId="all-users-verification-label"
              value={rsiFilter === undefined ? "" : rsiFilter.toString()}
              label={t("adminUsers.verification")}
              onChange={(e) => {
                setRsiFilter(
                  e.target.value === "" ? undefined : e.target.value === "true",
                )
                setPage(1) // Reset to first page when filtering
              }}
            >
              <MenuItem value="">{t("adminUsers.all_verification")}</MenuItem>
              <MenuItem value="true">{t("adminUsers.verified")}</MenuItem>
              <MenuItem value="false">{t("adminUsers.unverified")}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isLoading ? null : (
          <>
            {/* Custom Table with API Pagination */}
            <Box sx={{ width: "100%" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {headCells.map((cell) => (
                        <TableCell
                          key={cell.id as string}
                          align={cell.numeric ? "right" : "left"}
                          padding={cell.disablePadding ? "none" : "normal"}
                          sortDirection={orderBy === cell.id ? order : false}
                          sx={{
                            minWidth: cell.minWidth,
                            maxWidth: cell.maxWidth,
                          }}
                        >
                          {!cell.noSort ? (
                            <TableSortLabel
                              active={orderBy === cell.id}
                              direction={orderBy === cell.id ? order : "asc"}
                              onClick={() => handleRequestSort(cell.id)}
                            >
                              {t(cell.label)}
                            </TableSortLabel>
                          ) : (
                            t(cell.label)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user, index) => (
                      <PeopleRow
                        key={user.username}
                        row={user}
                        index={index}
                        onClick={() => {}}
                        isItemSelected={false}
                        labelId={`user-${index}`}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Custom Pagination Controls */}
              {pagination && (
                <NumberedPagination
                  count={pagination.total_users}
                  page={page - 1}
                  rowsPerPage={pageSize}
                  onPageChange={(newPage) => setPage(newPage + 1)}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  onRowsPerPageChange={(newPageSize) => {
                    setPageSize(newPageSize)
                    setPage(1) // Reset to first page when changing page size
                  }}
                />
              )}
            </Box>
          </>
        )}
      </Section>
    </>
  )
}

export function AdminDailyActivity() {
  const { data } = useGetAdminActivityQuery()
  const { t } = useTranslation()

  return (
    <>
      <Section xs={12} title={t("adminUsers.daily_activity")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              {
                name: t("adminUsers.active_users"),
                data: (data?.daily || []).map((u) => ({
                  x: new Date(u.date).toISOString(),
                  y: u.count,
                })),
              },
            ]}
            height={400}
          />
        </Grid>
      </Section>
      <Section xs={12} title={t("adminUsers.weekly_activity")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              {
                name: t("adminUsers.active_users"),
                data: (data?.weekly || []).map((u) => ({
                  x: new Date(u.date).toISOString(),
                  y: u.count,
                })),
              },
            ]}
            height={400}
          />
        </Grid>
      </Section>
      <Section xs={12} title={t("adminUsers.monthly_activity")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              {
                name: t("adminUsers.active_users"),
                data: (data?.monthly || []).map((u) => ({
                  x: new Date(u.date).toISOString(),
                  y: u.count,
                })),
              },
            ]}
            height={400}
          />
        </Grid>
      </Section>
    </>
  )
}

export function AdminMembershipAnalytics() {
  const { data, isLoading, error } = useGetAdminMembershipAnalyticsQuery()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Section xs={12} title={t("adminUsers.membership_count")}>
        <Grid item xs={12}>
          <div>{t("appUi.adminUsers.membershipLoading")}</div>
        </Grid>
      </Section>
    )
  }

  if (error) {
    return (
      <Section xs={12} title={t("adminUsers.membership_count")}>
        <Grid item xs={12}>
          <div>
            {t("appUi.adminUsers.membershipError", {
              error: JSON.stringify(error),
            })}
          </div>
        </Grid>
      </Section>
    )
  }

  if (!data || !data.daily_totals || data.daily_totals.length === 0) {
    return (
      <Section xs={12} title={t("adminUsers.membership_count")}>
        <Grid item xs={12}>
          <div>{t("appUi.adminUsers.membershipEmpty")}</div>
        </Grid>
      </Section>
    )
  }

  return (
    <Section xs={12} title={t("adminUsers.membership_count")}>
      {/* Summary Statistics */}
      <Grid item xs={12} md={6} lg={3}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color="primary">
            {data.summary?.total_members || "0"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("appUi.adminUsers.totalMembers")}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color="success.main">
            {data.summary?.rsi_confirmed_members || "0"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("appUi.adminUsers.rsiVerified")}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color="warning.main">
            {data.summary?.new_members_30d || "0"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("appUi.adminUsers.new30Days")}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color="info.main">
            {data.summary?.new_members_7d || "0"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("appUi.adminUsers.new7Days")}
          </Typography>
        </Box>
      </Grid>

      {/* Daily Membership Chart */}
      <Grid item xs={12}>
        <MuiAreaChart
          series={[
            {
              name: t("appUi.adminUsers.totalMembers"),
              data: data.daily_totals.map((u) => ({
                x: new Date(u.date).toISOString(),
                y: u.cumulative_members,
              })),
            },
            {
              name: t("appUi.adminUsers.rsiVerified"),
              data: data.daily_totals.map((u) => ({
                x: new Date(u.date).toISOString(),
                y: u.cumulative_members_rsi_verified,
              })),
            },
            {
              name: t("appUi.adminUsers.newMembers"),
              data: data.daily_totals.map((u) => ({
                x: new Date(u.date).toISOString(),
                y: u.new_members,
              })),
            },
          ]}
          height={400}
        />
      </Grid>
    </Section>
  )
}
