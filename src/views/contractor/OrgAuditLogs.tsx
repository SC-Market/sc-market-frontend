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
import { ExpandMore, ExpandLess } from "@mui/icons-material"
import { useGetContractorAuditLogsQuery } from "../../store/contractor"
import { useTranslation } from "react-i18next"
import { AuditLogEntry } from "../../datatypes/Contractor"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  ControlledTable,
  HeadCell,
} from "../../components/table/PaginatedTable"

// Date formatting helper
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatAction(action: string): string {
  // Format action strings like "org.archived" to "Org Archived"
  // Also handle underscores like "member.role_assigned" to "Member Role Assigned"
  return action
    .split(".")
    .map((word) =>
      word
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    )
    .join(" ")
}

function getActionColor(
  action: string,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  if (action.includes("archive") || action.includes("delete")) {
    return "error"
  }
  if (action.includes("create") || action.includes("add")) {
    return "success"
  }
  if (action.includes("update") || action.includes("modify")) {
    return "warning"
  }
  return "default"
}

// List of known audit log actions
const AUDIT_LOG_ACTIONS = [
  "org.created",
  "org.updated",
  "org.archived",
  "member.added",
  "member.removed",
  "member.role_assigned",
  "member.role_removed",
  "role.created",
  "role.updated",
  "role.deleted",
  "invite.created",
  "invite.deleted",
  "invite.accepted",
  "order.cancelled",
  "offer.rejected",
  "settings.updated",
  "discord.linked",
] as const

type AuditLogAction = (typeof AUDIT_LOG_ACTIONS)[number]

const headCells: readonly HeadCell<AuditLogEntry & { expanded?: boolean }>[] = [
  {
    id: "expanded",
    numeric: false,
    disablePadding: true,
    label: "",
    noSort: true,
  },
  {
    id: "action",
    numeric: false,
    disablePadding: true,
    label: "orgAuditLogs.action",
    noSort: true,
  },
  {
    id: "actor",
    numeric: false,
    disablePadding: false,
    label: "orgAuditLogs.actor",
    noSort: true,
  },
  {
    id: "created_at",
    numeric: false,
    disablePadding: false,
    label: "orgAuditLogs.timestamp",
    noSort: false,
  },
]

export function OrgAuditLogs() {
  const [contractor] = useCurrentOrg()
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [actionFilter, setActionFilter] = useState<string>("")

  // Get localized action label
  const getActionLabel = (action: string): string => {
    const key = `orgAuditLogs.action.${action.replace(/\./g, "_")}`
    const translated = t(key)
    // If translation exists, use it; otherwise format the action name
    return translated !== key ? translated : formatAction(action)
  }
  const [actorIdFilter, setActorIdFilter] = useState<string>("")
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
      actor_id: actorIdFilter || undefined,
      start_date: startDateFilter || undefined,
      end_date: endDateFilter || undefined,
    },
    { skip: !contractor?.spectrum_id },
  )

  const handleClearFilters = () => {
    setActionFilter("")
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
            <TextField
              label={t("orgAuditLogs.filter_actor_id")}
              value={actorIdFilter}
              onChange={(e) => {
                setActorIdFilter(e.target.value)
                setPage(0)
              }}
              size="small"
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
                          disabled={!hasMetadata}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
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
                          {formatDate(entry.created_at)}
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
