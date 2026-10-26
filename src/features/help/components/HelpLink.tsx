import React from "react"
import { Link, type SxProps, type Theme } from "@mui/material"
import { HelpOutlineRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { GUIDE_LINKS, type GuideLink } from "../guideLinks"
import { isOfficialSite, officialHelpUrl } from "../links"

/**
 * A small "Learn how" link to a guide, for the page or section it explains.
 * It opens the guide in a new tab, so a half-filled form isn't lost. On a
 * white-label org domain it opens the guide on sc-market.space (the guides
 * only render there), like the sidebar's Help & Guides.
 */
export function HelpLink(props: {
  guide: GuideLink
  /** Link text; defaults to "Learn how". */
  children?: React.ReactNode
  sx?: SxProps<Theme>
}) {
  const { t } = useTranslation()
  const path = GUIDE_LINKS[props.guide]
  return (
    <Link
      href={isOfficialSite() ? path : officialHelpUrl(path)}
      target="_blank"
      rel="noopener"
      variant="body2"
      underline="hover"
      color="primary"
      data-guide={path}
      sx={[
        { display: "inline-flex", alignItems: "center", gap: 0.5 },
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
    >
      <HelpOutlineRounded sx={{ fontSize: "1.1em" }} aria-hidden />
      {props.children ?? t("help.learnHow", "Learn how")}
    </Link>
  )
}
