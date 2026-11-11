import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  TextField,
  Box,
} from "@mui/material"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"
import {
  useListContentReportsQuery,
  type AdminContentReport,
  type ContentReportStatus,
} from "../../store/api/v2/market"
import { useUpdateReport } from "../../features/admin/hooks/useModerationActions"
import { UserDetails } from "../../components/list/UserDetails"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { safeRedirectPath } from "../../util/safeRedirect"
import { useFormatters } from "../../util/format"

const REPORT_STATUSES: readonly ContentReportStatus[] = [
  "pending",
  "in_progress",
  "resolved",
  "dismissed",
]

/** A select's value as a report status ("" for none / all). */
function asReportStatus(value: string): ContentReportStatus | "" {
  return REPORT_STATUSES.find((status) => status === value) ?? ""
}

export function AdminModerationView() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState<ContentReportStatus | "">(
    "pending",
  )
  const [selectedReport, setSelectedReport] =
    useState<AdminContentReport | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<ContentReportStatus | "">("")
  const [updateNotes, setUpdateNotes] = useState("")

  const {
    data: reportsData,
    isLoading,
    error,
  } = useListContentReportsQuery({
    page,
    pageSize,
    status: statusFilter || undefined,
  })

  const { update: updateReport, isUpdating } = useUpdateReport()

  const handleOpenModal = (report: AdminContentReport) => {
    setSelectedReport(report)
    setUpdateStatus(report.status)
    setUpdateNotes(report.notes || "")
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReport(null)
    setUpdateStatus("")
    setUpdateNotes("")
  }

  const handleUpdateReport = async () => {
    if (!selectedReport || !updateStatus) return

    const updated = await updateReport(selectedReport.report_id, {
      status: updateStatus,
      notes: updateNotes || undefined,
    })
    if (updated) handleCloseModal()
  }

  const columns: GridColDef[] = [
    {
      field: "reporter",
      headerName: t("adminUi.moderation.reporter"),
      width: 200,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <UserDetails user={params.value} />
      ),
    },
    {
      field: "reported_url",
      headerName: t("adminUi.moderation.reportedUrl"),
      width: 300,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="text"
          color="primary"
          onClick={() => {
            const path = safeRedirectPath(params.value, "")
            if (path) window.open(path, "_blank", "noopener")
          }}
        >
          {t("admin.alerts.field.link")}
        </Button>
      ),
    },
    {
      field: "report_reason",
      headerName: t("adminUi.moderation.reason"),
      width: 150,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "created_at",
      headerName: t("admin.alerts.createdAt"),
      width: 120,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{fmt.date(params.value)}</Typography>
      ),
    },
    {
      field: "status",
      headerName: t("admin.moderation.field.status"),
      width: 120,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === "pending"
              ? "warning"
              : params.value === "in_progress"
                ? "info"
                : params.value === "resolved"
                  ? "success"
                  : "default"
          }
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: t("admin.moderation.column.actions", "Actions"),
      width: 120,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenModal(params.row)}
        >
          {t("admin.moderation.button.handle", "Handle")}
        </Button>
      ),
    },
  ]

  const rows = React.useMemo(() => {
    if (!reportsData?.reports) return []
    return reportsData.reports.map((report) => ({
      ...report,
      id: report.report_id,
    }))
  }, [reportsData?.reports])

  return (
    <>
      <Grid
        item
        container
        xs={12}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <HeaderTitle xs={12} md={6}>
          {t("admin.moderation.title", "Moderation Dashboard")}
        </HeaderTitle>
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="admin-moderation-view-status-filter-label">
              {t("admin.moderation.filter.status", "Status Filter")}
            </InputLabel>
            <Select
              labelId="admin-moderation-view-status-filter-label"
              value={statusFilter}
              label={t("admin.moderation.filter.status", "Status Filter")}
              onChange={(e) => setStatusFilter(asReportStatus(e.target.value))}
            >
              <MenuItem value="">{t("adminUi.common.allStatuses")}</MenuItem>
              <MenuItem value="pending">
                {t("adminUi.moderation.statuses.pending")}
              </MenuItem>
              <MenuItem value="in_progress">
                {t("adminUi.moderation.statuses.inProgress")}
              </MenuItem>
              <MenuItem value="resolved">
                {t("adminUi.moderation.statuses.resolved")}
              </MenuItem>
              <MenuItem value="dismissed">
                {t("adminUi.moderation.statuses.dismissed")}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {reportsData && (
        <Grid item xs={12}>
          <ThemedDataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: {
                paginationModel: { page: page - 1, pageSize },
              },
            }}
            onPaginationModelChange={(model) => {
              setPage(model.page + 1)
              setPageSize(model.pageSize)
            }}
            loading={isLoading}
          />
        </Grid>
      )}
      {error && (
        <Grid item xs={12}>
          <Typography variant="body1" color="error">
            {t("adminUi.moderation.loadError", {
              error: JSON.stringify(error),
            })}
          </Typography>
        </Grid>
      )}

      {/* Handle Report Modal */}
      <ResponsiveDialog
        open={isModalOpen}
        onClose={handleCloseModal}
        title={t("admin.moderation.dialog.handleReport", "Handle Report")}
        maxWidth="sm"
        disableClose={isUpdating}
        disableBackdropClose
        actions={
          <>
            <Button onClick={handleCloseModal} disabled={isUpdating}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdateReport}
              variant="contained"
              disabled={isUpdating}
            >
              {isUpdating
                ? t("admin.moderation.updating", "Updating...")
                : t("admin.moderation.updateReport", "Update Report")}
            </Button>
          </>
        }
      >
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="admin-moderation-view-status-label">
              {t("admin.moderation.field.status", "Status")}
            </InputLabel>
            <Select
              labelId="admin-moderation-view-status-label"
              value={updateStatus}
              label={t("admin.moderation.field.status", "Status")}
              onChange={(e) => setUpdateStatus(asReportStatus(e.target.value))}
            >
              <MenuItem value="pending">
                {t("adminUi.moderation.statuses.pending")}
              </MenuItem>
              <MenuItem value="in_progress">
                {t("adminUi.moderation.statuses.inProgress")}
              </MenuItem>
              <MenuItem value="resolved">
                {t("adminUi.moderation.statuses.resolved")}
              </MenuItem>
              <MenuItem value="dismissed">
                {t("adminUi.moderation.statuses.dismissed")}
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t("admin.moderation.notes", "Notes")}
            placeholder={t(
              "admin.moderation.notesPlaceholder",
              "Enter moderation notes or action taken...",
            )}
            helperText={t(
              "admin.moderation.notesHelperText",
              "Optional notes about the moderation action (max 2000 characters)",
            )}
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
            inputProps={{ maxLength: 2000 }}
          />
        </Box>
      </ResponsiveDialog>
    </>
  )
}
