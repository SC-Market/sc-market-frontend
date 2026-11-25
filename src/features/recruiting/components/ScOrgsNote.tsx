import React from "react"
import { Link, Typography, type SxProps, type Theme } from "@mui/material"
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"

/** SC Orgs, the sister site for running orgs (directory, applications, members). */
export const SC_ORGS_URL = "https://sc-orgs.space"

/** The trailing external-link mark of a text link (ARCHITECTURE.md, Button icons). */
const EXTERNAL_MARK_SX = {
  fontSize: "1em",
  ml: 0.5,
  verticalAlign: "-0.125em",
} as const

/** What the first line points to, per page (copy and SC Orgs destination). */
const NOTES = {
  // /recruiting and the create-post form
  recruiting: {
    text: (t: TFunction) =>
      t(
        "recruiting.scOrgsNote",
        "Recruiting? SC Orgs has applications, an org directory and member tools",
      ),
    href: SC_ORGS_URL,
  },
  // /contractors (the Organizations directory)
  directory: {
    text: (t: TFunction) =>
      t(
        "scOrgs.directoryNote",
        "Looking for more orgs? Browse the org directory on SC Orgs, our sister site",
      ),
    href: `${SC_ORGS_URL}/communities`,
  },
  // /org/register
  register: {
    text: (t: TFunction) =>
      t(
        "scOrgs.registerNote",
        "You can also run your org on SC Orgs, our sister site: rosters, events and applications",
      ),
    href: `${SC_ORGS_URL}/guides/register-your-org`,
  },
} as const

/**
 * One line pointing to SC Orgs: recruiters on the recruiting pages
 * (default), the org directory on /contractors, running an org there on
 * /org/register. With `players` (the /recruiting list), a second line for
 * players: SC Orgs' Looking for Org board. Static text, so the page and its
 * skeletons render it identically (no shift).
 */
export function ScOrgsNote(props: {
  sx?: SxProps<Theme>
  players?: boolean
  topic?: keyof typeof NOTES
}) {
  const { t } = useTranslation()
  const note = NOTES[props.topic ?? "recruiting"]
  return (
    <Typography variant="body2" color="text.secondary" sx={props.sx}>
      <Link
        href={note.href}
        target="_blank"
        rel="noopener"
        underline="hover"
        color="primary"
      >
        {note.text(t)}
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
