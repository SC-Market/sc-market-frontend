import React, { useState } from "react"
import { IconButton, Tooltip, Snackbar } from "@mui/material"
import { ShareRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

interface ShareButtonProps {
  url?: string
  title?: string
  text?: string
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const { t } = useTranslation()
  const [showCopied, setShowCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = url || window.location.href
    const shareData = {
      title: title || document.title,
      text: text || "",
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShowCopied(true)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  return (
    <>
      <Tooltip title={t("ui.share", "Share")}>
        <IconButton onClick={handleShare} size="small">
          <ShareRounded />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message={t("ui.linkCopied", "Link copied to clipboard")}
      />
    </>
  )
}
