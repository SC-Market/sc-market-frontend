import { useLocation } from "react-router-dom"
import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Button,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { ReportRounded as ReportIcon } from "@mui/icons-material"
import type { CreateReportRequest } from "../../features/admin/api/moderationApi"
import { useReportContent } from "../../features/admin/hooks/useModerationActions"
import { useTranslation } from "react-i18next"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { UnderlineLink } from "../typography/UnderlineLink"
import { BottomSheet } from "../mobile/BottomSheet"

interface ReportButtonProps {
  reportedUrl?: string // Optional custom URL, defaults to current page
  children?: React.ReactNode
}

export function ReportButton({
  reportedUrl,
  children = "Report",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState<string>("")
  const { submit, isSubmitting } = useReportContent()
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const { data: profile } = useGetUserProfileQuery()

  // Get current page path if none provided (from the router: this also
  // renders at build time for prerendered pages, where there's no window)
  const { pathname } = useLocation()
  const getCurrentUrl = () => reportedUrl || pathname

  const handleOpen = () => {
    // Check if user is authenticated
    if (!profile) {
      // Redirect to frontend login page with current path as redirect parameter
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }

    setOpen(true)
    setReason("")
    setDetails("")
  }

  const handleClose = () => {
    setOpen(false)
    setReason("")
    setDetails("")
  }

  const handleSubmit = async () => {
    const sent = await submit(
      getCurrentUrl(),
      reason as CreateReportRequest["report_reason"] | "",
      details,
    )
    if (sent) handleClose()
  }

  const reportReasons = [
    {
      value: "inappropriate_content",
      label: t("ReportButton.reasons.inappropriateContent"),
    },
    { value: "spam", label: t("ReportButton.reasons.spam") },
    { value: "harassment", label: t("ReportButton.reasons.harassment") },
    { value: "fake_listing", label: t("ReportButton.reasons.fakeListing") },
    { value: "scam", label: t("ReportButton.reasons.scam") },
    {
      value: "copyright_violation",
      label: t("ReportButton.reasons.copyrightViolation"),
    },
    { value: "other", label: t("ReportButton.reasons.other") },
  ]

  // Content to reuse
  const dialogContent = (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("ReportButton.reportDescription")}
      </Typography>

      <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
        {t("ReportButton.reportingUrl")}:{" "}
        <code
          style={{
            padding: "2px 4px",
            borderRadius: "3px",
          }}
        >
          {getCurrentUrl()}
        </code>
      </Typography>

      <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
        <InputLabel id="report-reason-label">
          {t("ReportButton.reason")} *
        </InputLabel>
        <Select
          labelId="report-reason-label"
          value={reason}
          label={t("ReportButton.reason") + " *"}
          onChange={(e) => setReason(e.target.value)}
          required
        >
          {reportReasons.map((reasonOption) => (
            <MenuItem key={reasonOption.value} value={reasonOption.value}>
              {reasonOption.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={3}
        label={t("ReportButton.additionalDetails")}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder={t("ReportButton.detailsPlaceholder")}
        helperText={t("ReportButton.detailsHelperText")}
        inputProps={{ maxLength: 1000 }}
      />
    </>
  )

  const dialogActions = (
    <>
      <Button
        onClick={handleClose}
        disabled={isSubmitting}
        aria-label={t("accessibility.cancelReport", "Cancel report")}
      >
        {t("ReportButton.cancel")}
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="error"
        disabled={isSubmitting || !reason}
        startIcon={isSubmitting ? undefined : <ReportIcon />}
        aria-label={t("accessibility.submitReport", "Submit report")}
        aria-describedby={isSubmitting ? "submitting-status" : undefined}
      >
        {isSubmitting ? t("ReportButton.submitting") : t("ReportButton.submit")}
        {isSubmitting && (
          <span id="submitting-status" className="sr-only">
            {t(
              "accessibility.submittingReport",
              "Submitting report, please wait",
            )}
          </span>
        )}
      </Button>
    </>
  )

  return (
    <>
      <Box
        component="button"
        type="button"
        sx={{
          all: "unset",
          cursor: "pointer",
          color: "inherit",
          "&:focus-visible": {
            outline: "2px solid",
            outlineOffset: 2,
          },
        }}
        onClick={handleOpen}
        aria-label={t("accessibility.reportContent", "Report this content")}
        aria-describedby="report-button-description"
      >
        <UnderlineLink component="span">{children}</UnderlineLink>
        <span id="report-button-description" className="sr-only">
          {t(
            "accessibility.reportContentDescription",
            "Open report dialog to report inappropriate content",
          )}
        </span>
      </Box>

      {/* On mobile, use BottomSheet */}
      {isMobile ? (
        <BottomSheet
          open={open}
          onClose={handleClose}
          title={t("ReportButton.reportContent")}
          maxHeight="90vh"
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ReportIcon color="error" />
          </Box>
          {dialogContent}
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            {dialogActions}
          </Box>
        </BottomSheet>
      ) : (
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          aria-labelledby="report-dialog-title"
          aria-describedby="report-dialog-description"
        >
          <DialogTitle id="report-dialog-title">
            <Box display="flex" alignItems="center" gap={1}>
              <ReportIcon color="error" />
              {t("ReportButton.reportContent")}
            </Box>
          </DialogTitle>
          <DialogContent>{dialogContent}</DialogContent>
          <DialogActions>{dialogActions}</DialogActions>
        </Dialog>
      )}
    </>
  )
}
