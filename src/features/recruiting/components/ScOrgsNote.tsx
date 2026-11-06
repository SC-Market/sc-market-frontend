import React from "react"
import { Link, Typography, type SxProps, type Theme } from "@mui/material"
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded"
import { useTranslation } from "react-i18next"

/** SC Orgs, the sister site for running orgs (directory, applications, members). */
export const SC_ORGS_URL = "https://sc-orgs.space"

/** The trailing external-link mark of a text link (ARCHITECTURE.md, Button icons). */
const EXTERNAL_MARK_SX = {
  fontSize: "1em",
  ml: 0.5,
  verticalAlign: "-0.125em",
} as const

/**
 * One line pointing recruiters to SC Orgs, on the recruiting pages. With
 * `players` (the /recruiting list), a second line for players: SC Orgs'
 * Looking for Org board. Static text, so the page and its skeletons render
 * it identically (no shift).
 */
export function ScOrgsNote(props: { sx?: SxProps<Theme>; players?: boolean }) {
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
          "Recruiting? SC Orgs has applications, an org directory and member tools",
        )}
        <OpenInNewRounded aria-hidden sx={EXTERNAL_MARK_SX} />
      </Link>
      {props.players && (
        <>
          <br />
          <Link
            href={`${SC_ORGS_URL}/lfo`}
            target="_blank"
            rel="noopener"
            underline="hover"
            color="primary"
          >
            {t(
              "recruiting.scOrgsLfoNote",
              "Looking for an org? Post on the Looking for Org board on SC Orgs, and orgs come to you",
            )}
            <OpenInNewRounded aria-hidden sx={EXTERNAL_MARK_SX} />
          </Link>
        </>
      )}
    </Typography>
  )
}
