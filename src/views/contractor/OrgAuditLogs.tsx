import React, { useMemo, useState } from "react"
import throttle from "lodash/throttle"
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  TableRow,
  TableCell,
  TextField,
  Typography,
  IconButton,
  Collapse,
  Autocomplete,
} from "@mui/material"
import { ExpandMoreRounded, ExpandLessRounded } from "@mui/icons-material"
import {
  useGetContractorAuditLogsQuery,
  useSearchContractorMembersQuery,
} from "../../features/contractor/api/contractorApi"
import { useTranslation } from "react-i18next"
import { AuditLogEntry } from "../../features/contractor/domain/types"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { ControlledTable } from "../../components/table/PaginatedTable"
import { useFormatters } from "../../util/format"
import {
  formatDate,
  formatAction,
  getActionColor,
  AUDIT_LOG_ACTIONS,
  auditActionKey,
  headCells,
} from "./orgAuditLogConfig"

export function OrgAuditLogs() {
  const fmt = useFormatters()
  const [contractor] = useCurrentOrg()
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [actionFilter, setActionFilter] = useState<string>("")

  // Get localized action label
  const getActionLabel = (action: string): string => {
    const key = auditActionKey(action)
    const translated = t(key)
    // If translation exists, use it; otherwise format the action name
    return translated !== key ? translated : formatAction(action)
  }
  // Filter by member: autocomplete over the org's members (any username can
  // be typed, for someone who has since left).
  const [actorUsernameFilter, setActorUsernameFilter] = useState<string>("")
  const [actorInput, setActorInput] = useState<string>("")
  const [actorQuery, setActorQuery] = useState<string>("")
  const searchActors = useMemo(
    () => throttle((q: string) => setActorQuery(q), 400),
    [],
  )
  const { data: actorOptions = [] } = useSearchContractorMembersQuery(
    { spectrum_id: contractor?.spectrum_id || "", query: actorQuery },
    { skip: !contractor?.spectrum_id || actorQuery.length < 2 },
  )
  const [startDateFilter, setStartDateFilter] = useState<string>("")
  const [endDateFilter, setEndDateFilter] = useState<string>("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [orderBy, setOrderBy] = useState<string>("created_at")
  const [order, setOrder] = useState<"asc" | "desc">("desc")

  const { data, isLoading, error } = useGetContractorAuditLogsQuery(
    {
      spectrum_id: contractor?.spectrum_id || "",
      page: page + 1, // Backend uses 1-based pagination
      page_size: pageSize,
      action: actionFilter || undefined,
      actor_username: actorUsernameFilter || undefined,
      start_date: startDateFilter || undefined,
      end_date: endDateFilter || undefined,
    },
    { skip: !contractor?.spectrum_id },
  )

  const handleClearFilters = () => {
    setActionFilter("")
    setActorUsernameFilter("")
    setActorInput("")
    setStartDateFilter("")
    setEndDateFilter("")
    setPage(0)
  }

  const toggleExpanded = (auditLogId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(auditLogId)) {
      newExpanded.delete(auditLogId)
    } else {
      newExpanded.add(auditLogId)
    }
    setExpandedRows(newExpanded)
  }

  if (isLoading) {
    return (
      <Grid item xs={12}>
        <Paper>
          <Box p={3}>
            <Typography>{t("orgAuditLogs.loading")}</Typography>
          </Box>
        </Paper>
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid item xs={12}>
        <Paper>
          <Box p={3}>
            <Typography color="error">{t("orgAuditLogs.error")}</Typography>
          </Box>
        </Paper>
      </Grid>
    )
  }

  const rows = (data?.items || []).map((entry) => ({
    ...entry,
    expanded: expandedRows.has(entry.audit_log_id),
  }))

  return (
    <Grid item xs={12}>
      <Paper>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            {t("orgAuditLogs.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t("orgAuditLogs.description")}
          </Typography>

          {/* Filters */}
          <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Autocomplete
              options={AUDIT_LOG_ACTIONS}
              value={actionFilter || null}
              onChange={(event, newValue) => {
                setActionFilter(newValue || "")
                setPage(0)
              }}
              getOptionLabel={(option) => {
                if (typeof option === "string") {
                  return getActionLabel(option)
                }
                return option
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("orgAuditLogs.filter_action")}
                  size="small"
                />
              )}
              sx={{ minWidth: 200 }}
              freeSolo
            />
            <Autocomplete
              freeSolo
              options={actorOptions.map((u) => u.username)}
              filterOptions={(x) => x}
              value={actorUsernameFilter || null}
              inputValue={actorInput}
              onInputChange={(_e, value, reason) => {
                setActorInput(value)
                searchActors(value.trim())
                if (reason === "clear" || value === "") {
                  setActorUsernameFilter("")
                  setPage(0)
                }
              }}
              onChange={(_e, value) => {
                setActorUsernameFilter((value ?? "").trim())
                setPage(0)
              }}
              onBlur={() => {
                // A typed name (e.g. someone who has left) filters on blur.
                if (actorInput.trim() !== actorUsernameFilter) {
                  setActorUsernameFilter(actorInput.trim())
                  setPage(0)
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("orgAuditLogs.filter_actor")}
                  placeholder={t("orgAuditLogs.filter_actor_placeholder")}
                  size="small"
                />
              )}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label={t("orgAuditLogs.filter_start_date")}
              type="datetime-local"
              value={startDateFilter}
              onChange={(e) => {
                setStartDateFilter(e.target.value)
                setPage(0)
              }}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t("orgAuditLogs.filter_end_date")}
              type="datetime-local"
              value={endDateFilter}
              onChange={(e) => {
                setEndDateFilter(e.target.value)
                setPage(0)
              }}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="outlined" onClick={handleClearFilters}>
              {t("orgAuditLogs.clear_filters")}
            </Button>
          </Box>
        </Box>

        {/* Table - no padding */}
        {rows.length === 0 ? (
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              {t("orgAuditLogs.no_logs")}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              px: 0,
              "& .MuiTableContainer-root": {
                minHeight: "auto",
                maxHeight: "500px",
                overflow: "auto",
              },
            }}
          >
            <ControlledTable
              rows={rows}
              initialSort="created_at"
              keyAttr="audit_log_id"
              headCells={headCells}
              disableSelect={true}
              generateRow={({ row }) => {
                const entry = row as AuditLogEntry
                const isExpanded = expandedRows.has(entry.audit_log_id)
                const hasMetadata = Object.keys(entry.metadata).length > 0

                return (
                  <React.Fragment key={entry.audit_log_id}>
                    <TableRow>
                      <TableCell padding="checkbox" width={50}>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpanded(entry.audit_log_id)}
                          aria-label={
                            isExpanded
                              ? t("ui.aria.hideDetails")
                              : t("ui.aria.showDetails")
                          }
                          aria-expanded={isExpanded}
                          disabled={!hasMetadata}
                        >
                          {isExpanded ? (
                            <ExpandLessRounded />
                          ) : (
                            <ExpandMoreRounded />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getActionLabel(entry.action)}
                          color={getActionColor(entry.action)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {entry.actor ? (
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {entry.actor.display_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              @{entry.actor.username}
                            </Typography>
                          </Box>
                        ) : entry.actor_id ? (
                          <Typography variant="body2" color="text.secondary">
                            {entry.actor_id.substring(0, 8)}...
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                          >
                            {t("orgAuditLogs.system")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(entry.created_at, fmt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {isExpanded && hasMetadata && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ py: 0 }}>
                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {t("orgAuditLogs.metadata")}
                              </Typography>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  backgroundColor: "background.default",
                                  maxHeight: 300,
                                  overflow: "auto",
                                }}
                              >
                                <pre
                                  style={{ margin: 0, fontSize: "0.875rem" }}
                                >
                                  {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                              </Paper>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              }}
              onPageChange={setPage}
              page={page}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
              onOrderByChange={setOrderBy}
              orderBy={orderBy}
              onOrderChange={setOrder}
              order={order}
              rowCount={data?.total || 0}
            />
          </Box>
        )}

        {/* Summary */}
        {data && (
          <Box sx={{ p: 3, pt: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {t("orgAuditLogs.summary", {
                total: data.total,
                page: data.page,
                pageSize: data.page_size,
              })}
            </Typography>
          </Box>
        )}
      </Paper>
    </Grid>
  )
}
