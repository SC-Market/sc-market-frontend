/**
 * The footer's building blocks: its colours, a link column, a link and a
 * link inside a notice (Footer.tsx lays them out).
 */
import { UnderlineLink } from "../typography/UnderlineLink"
import { Box, Link, LinkProps, Typography } from "@mui/material"
import React, { useId, useMemo } from "react"
import { alpha, useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  AA_TEXT,
  ensureContrast,
  flatten,
  mix,
  surfaces,
  withContrast,
} from "../../hooks/styles/theme/contrast"

/** The footer's width breakpoints, measured on the footer itself. */
export const MEDIUM = "@container sc-footer (max-width: 1059px)"
export const PHONE = "@container sc-footer (max-width: 719px)"

/** The notices' floor on the band: a little over AA, as in the mockup. */
const NOTICE_CONTRAST = 5

/**
 * The footer band's colours, from the theme:
 * - band: the navbar surface in dark themes. Light themes have a dark navbar,
 *   so there the band is the paper tinted 4% towards it (#f5f6f6 on white).
 * - hover: text.accent, kept at 4.5:1 on the band.
 * - notice: text.subtle, raised to NOTICE_CONTRAST on the band.
 * Custom themes the contrast maths can't read keep plain theme values.
 */
export function useFooterColors(theme: ExtendedTheme) {
  return useMemo(() => {
    const { palette } = theme
    const fallback = {
      band: palette.background.paper,
      hover: palette.text.accent ?? palette.primary.main,
      notice: palette.text.primary,
    }
    return {
      ...fallback,
      ...withContrast(() => {
        const { paper } = surfaces(theme)
        const navbar = flatten(palette.background.navbar ?? paper, paper)
        const band = palette.mode === "dark" ? navbar : mix(paper, navbar, 0.04)
        return {
          band,
          hover: ensureContrast(fallback.hover, [band], AA_TEXT),
          notice: ensureContrast(
            flatten(palette.text.subtle ?? palette.text.primary, band),
            [band],
            NOTICE_CONTRAST,
          ),
        }
      }),
    }
  }, [theme])
}

export type FooterColors = ReturnType<typeof useFooterColors>

/** One footer column: a labelled nav landmark with a heading and a link list. */
export function FooterGroup(props: {
  title: string
  colors: FooterColors
  children: React.ReactNode
}) {
  const id = useId()
  const theme = useTheme<ExtendedTheme>()
  const { hover } = props.colors
  return (
    <Box component="nav" aria-labelledby={id} sx={{ minWidth: 0 }}>
      <Typography
        id={id}
        component="h2"
        color="text.secondary"
        sx={{
          fontFamily: theme.typography.fontFamilyHeading,
          fontSize: "0.84375rem",
          fontWeight: 600,
          letterSpacing: "0.01em",
          lineHeight: 1.4,
          mb: 1.25,
        }}
      >
        {props.title}
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          fontSize: "0.875rem",
          lineHeight: 1.43,
          // Links (and the Report button) are muted at rest; on hover and
          // keyboard focus they take the accent and the UnderlineLink line.
          "& a, & button": {
            color: "text.primary",
            transition: theme.transitions.create("color", {
              duration: theme.transitions.duration.shortest,
            }),
            "&:hover, &:focus-visible": { color: hover },
            "&:hover > span::after, &:focus-visible > span::after": {
              transform: "scaleX(1)",
              transformOrigin: "bottom left",
            },
          },
          // Phones: taller rows, so each link is an easier touch target.
          [PHONE]: {
            gap: 0,
            "& li > *": { display: "inline-block", py: 0.75 },
          },
        }}
      >
        {props.children}
      </Box>
    </Box>
  )
}

/** A footer list item: a muted link with the site's hover underline. */
export function FooterLink({
  children,
  ...props
}: LinkProps & {
  /** RouterLink or "button"; `to` goes with RouterLink. */
  component?: React.ElementType
  to?: string
  type?: "button"
}) {
  return (
    <li>
      <Link color="inherit" underline="none" {...props}>
        <UnderlineLink component="span">{children}</UnderlineLink>
      </Link>
    </li>
  )
}

/**
 * An off-site link inside a notice. It keeps a permanent underline, so it
 * isn't told apart by colour alone; `label` names it.
 */
export function NoticeLink(props: {
  href: string
  label?: string
  colors: FooterColors
}) {
  const { notice, hover } = props.colors
  return (
    <Link
      rel="noopener noreferrer"
      target="_blank"
      href={props.href}
      underline="always"
      sx={{
        color: "inherit",
        textDecorationColor: alpha(notice, 0.55),
        textUnderlineOffset: 2,
        "&:hover, &:focus-visible": {
          color: hover,
          textDecorationColor: hover,
        },
      }}
    >
      {props.label ?? new URL(props.href).hostname}
    </Link>
  )
}
