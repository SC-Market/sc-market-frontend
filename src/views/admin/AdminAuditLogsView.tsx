import React, { useState } from "react"
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
  useGetAdminAuditLogsQuery,
  type AdminAuditLogEntry,
} from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { ControlledTable } from "../../components/table/PaginatedTable"
import { useFormatters } from "../../util/format"
import {
  formatDate,
  formatAction,
  getActionColor,
  AUDIT_LOG_ACTIONS,
  headCells,
} from "./adminAuditLogColumns"

export function AdminAuditLogsView() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [actionFilter, setActionFilter] = useState<string>("")

  // Get localized action label
  const getActionLabel = (action: string): string => {
    const key = `adminAuditLogs.action.${action.replace(/\./g, "_")}`
    const translated = t(key)
    // If translation exists, use it; otherwise format the action name
    return translated !== key ? translated : formatAction(action)
  }
  const [subjectTypeFilter, setSubjectTypeFilter] = useState<string>("")
  const [subjectIdFilter, setSubjectIdFilter] = useState<string>("")
  const [actorIdFilter, setActorIdFilter] = useState<string>("")
  const [startDateFilter, setStartDateFilter] = useState<string>("")
  const [endDateFilter, setEndDateFilter] = useState<string>("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [orderBy, setOrderBy] = useState<string>("created_at")
  const [order, setOrder] = useState<"asc" | "desc">("desc")

  const { data, isLoading, error } = useGetAdminAuditLogsQuery({
    page: page + 1, // Backend uses 1-based pagination
    pageSize,
    action: actionFilter || undefined,
    subjectType: subjectTypeFilter || undefined,
    subjectId: subjectIdFilter || undefined,
    actorId: actorIdFilter || undefined,
    startDate: startDateFilter || undefined,
    endDate: endDateFilter || undefined,
  })

  const handleClearFilters = () => {
    setActionFilter("")
    setSubjectTypeFilter("")
    setSubjectIdFilter("")
    setActorIdFilter("")
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
            <Typography>{t("adminAuditLogs.loading")}</Typography>
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
            <Typography color="error">{t("adminAuditLogs.error")}</Typography>
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
            {t("adminAuditLogs.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t("adminAuditLogs.description")}
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
                  label={t("adminAuditLogs.filter_action")}
                  size="small"
                />
              )}
              sx={{ minWidth: 200 }}
              freeSolo
            />
            <TextField
              label={t("adminAuditLogs.filter_subject_type")}
              value={subjectTypeFilter}
              onChange={(e) => {
                setSubjectTypeFilter(e.target.value)
                setPage(0)
              }}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label={t("adminAuditLogs.filter_subject_id")}
              value={subjectIdFilter}
              onChange={(e) => {
                setSubjectIdFilter(e.target.value)
                setPage(0)
              }}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label={t("adminAuditLogs.filter_actor_id")}
              value={actorIdFilter}
              onChange={(e) => {
                setActorIdFilter(e.target.value)
                setPage(0)
              }}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label={t("adminAuditLogs.filter_start_date")}
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
              label={t("adminAuditLogs.filter_end_date")}
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
              {t("adminAuditLogs.clear_filters")}
            </Button>
          </Box>
        </Box>

        {/* Table - no padding */}
        {rows.length === 0 ? (
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              {t("adminAuditLogs.no_logs")}
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
                const entry: AdminAuditLogEntry = row
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
                            {t("adminAuditLogs.system")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.contractor ? (
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {entry.contractor.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {entry.contractor.spectrum_id}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                          >
                            {t("adminAuditLogs.no_contractor")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.subject_type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.subject_id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(entry.created_at, fmt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {isExpanded && hasMetadata && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0 }}>
                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {t("adminAuditLogs.metadata")}
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
              {t("adminAuditLogs.summary", {
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
