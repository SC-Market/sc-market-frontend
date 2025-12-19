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
import { Report as ReportIcon } from "@mui/icons-material"
import { useReportContentMutation } from "../../store/moderation"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { BACKEND_URL } from "../../util/constants"
import { UnderlineLink } from "../typography/UnderlineLink"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [reportContent] = useReportContentMutation()
  const issueAlert = useAlertHook()
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()

  // Get current page path if none provided
  const getCurrentUrl = () => {
    if (reportedUrl) return reportedUrl
    return window.location.pathname
  }

  const handleOpen = () => {
    // Check if user is authenticated
    if (!currentOrg) {
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

  const handleSubmit = () => {
    if (!reason) {
      issueAlert({
        message: t("ReportButton.pleaseSelectReason"),
        severity: "warning",
      })
      return
    }

    setIsSubmitting(true)
    reportContent({
      reported_url: getCurrentUrl(),
      report_reason: reason as any,
      report_details: details || undefined,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("ReportButton.reportSubmitted"),
          severity: "success",
        })
        handleClose()
      })
      .catch((error) => {
        console.error("Failed to submit report:", error)
        issueAlert(error)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
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

  return (
    <>
      <a
        href={"#"}
        style={{ textDecoration: "none", color: "inherit" }}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label={t("accessibility.reportContent", "Report this content")}
        aria-describedby="report-button-description"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleOpen()
          }
        }}
      >
        <UnderlineLink>{children}</UnderlineLink>
        <span id="report-button-description" className="sr-only">
          {t(
            "accessibility.reportContentDescription",
            "Open report dialog to report inappropriate content",
          )}
        </span>
      </a>

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

        <DialogContent>
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
        </DialogContent>

        <DialogActions>
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
            {isSubmitting
              ? t("ReportButton.submitting")
              : t("ReportButton.submit")}
            {isSubmitting && (
              <span id="submitting-status" className="sr-only">
                {t(
                  "accessibility.submittingReport",
                  "Submitting report, please wait",
                )}
              </span>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
