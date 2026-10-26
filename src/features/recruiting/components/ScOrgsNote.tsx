import React from "react"
import { Link, Typography, type SxProps, type Theme } from "@mui/material"
import { useTranslation } from "react-i18next"

/** SC Orgs, the sister site for running orgs (directory, applications, members). */
export const SC_ORGS_URL = "https://sc-orgs.space"

/**
 * One line pointing recruiters to SC Orgs, on the recruiting pages. Static
 * text, so the page and its skeletons render it identically (no shift).
 */
export function ScOrgsNote(props: { sx?: SxProps<Theme> }) {
  const { t } = useTranslation()
  return (
    <Typography variant="body2" color="text.secondary" sx={props.sx}>
      <Link
        href={SC_ORGS_URL}
        target="_blank"
        rel="noopener"
        underline="hover"
        color="primary"
      >
        {t(
          "recruiting.scOrgsNote",
          "Recruiting? SC Orgs has applications, an org directory and member tools →",
        )}
      </Link>
    </Typography>
  )
}
