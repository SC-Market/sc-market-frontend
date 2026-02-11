import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetAdminReportsQuery,
  useUpdateReportMutation,
} from "../../store/moderation"
import { ContentReport } from "../../store/moderation"
import { UserDetails } from "../../components/list/UserDetails"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';

export function AdminModerationView() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "in_progress" | "resolved" | "dismissed" | ""
  >("pending")
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState("")
  const [updateNotes, setUpdateNotes] = useState("")

  const {
    data: reportsData,
    isLoading,
    error,
  } = useGetAdminReportsQuery({
    page,
    page_size: pageSize,
    status: statusFilter || undefined,
  })

  const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation()

  const handleOpenModal = (report: ContentReport) => {
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

  const handleUpdateReport = () => {
    if (!selectedReport) return

    updateReport({
      reportId: selectedReport.report_id,
      data: {
        status: updateStatus as
          | "pending"
          | "in_progress"
          | "resolved"
          | "dismissed",
        notes: updateNotes || undefined,
      },
    })
      .unwrap()
      .then(() => {
        handleCloseModal()
      })
      .catch((error) => {
        console.error("Failed to update report:", error)
      })
  }

  const columns: GridColDef[] = [
    {
      field: "reporter",
      headerName: "Reporter",
      width: 200,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <UserDetails user={params.value} />
      ),
    },
    {
      field: "reported_url",
      headerName: "Reported URL",
      width: 300,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="text"
          color="primary"
          onClick={() => window.open(params.value, "_blank")}
        >
          Link
        </Button>
      ),
    },
    {
      field: "report_reason",
      headerName: "Reason",
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
      headerName: "Created",
      width: 120,
      display: "flex",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
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
            <InputLabel>
              {t("admin.moderation.filter.status", "Status Filter")}
            </InputLabel>
            <Select
              value={statusFilter}
              label={t("admin.moderation.filter.status", "Status Filter")}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="dismissed">Dismissed</MenuItem>
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
            Error loading moderation reports: {JSON.stringify(error)}
          </Typography>
        </Grid>
      )}

      {/* Handle Report Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("admin.moderation.dialog.handleReport", "Handle Report")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {t("admin.moderation.field.status", "Status")}
              </InputLabel>
              <Select
                value={updateStatus}
                label={t("admin.moderation.field.status", "Status")}
                onChange={(e) => setUpdateStatus(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="dismissed">Dismissed</MenuItem>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleUpdateReport}
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating
              ? t("admin.moderation.updating", "Updating...")
              : t("admin.moderation.updateReport", "Update Report")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
