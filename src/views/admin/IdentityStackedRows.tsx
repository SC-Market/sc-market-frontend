/**
 * Phone layout for the Admin -> Identity tables: each row becomes a bordered
 * block with its columns as label/value pairs, so nothing needs a sideways
 * scroll and long ids, handles and browser strings wrap. Desktop keeps the
 * tables (AdminIdentityView, IdentityUserPanel).
 */
import React from "react"
import { Box, ButtonBase, Stack, Typography } from "@mui/material"
import { alpha } from "@mui/material/styles"

export interface StackedField {
  label: string
  value: React.ReactNode
  /** Ids and handles: monospace. */
  mono?: boolean
  /** Long text (a reason, a browser string): the full row width. */
  wide?: boolean
}

export function StackedRows(props: {
  "aria-label": string
  children: React.ReactNode
}) {
  return (
    <Stack
      component="ul"
      spacing={1}
      aria-label={props["aria-label"]}
      sx={{ listStyle: "none", m: 0, p: 0 }}
    >
      {props.children}
    </Stack>
  )
}

/** A message in place of the rows (loading, nothing found). */
export function StackedRowsMessage(props: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.primary" sx={{ px: 0.5, py: 1 }}>
      {props.children}
    </Typography>
  )
}

export function StackedRow(props: {
  title?: React.ReactNode
  /** Next to the title (status chips). */
  adornment?: React.ReactNode
  fields: StackedField[]
  /** Makes the whole row a button (search results). */
  onClick?: () => void
  selected?: boolean
  testId?: string
}) {
  const { title, adornment, fields, onClick, selected, testId } = props
  const body = (
    <Stack spacing={1} sx={{ width: "100%", minWidth: 0, textAlign: "left" }}>
      {(title || adornment) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          {title && (
            <Typography
              variant="subtitle2"
              color={onClick ? "primary" : "text.secondary"}
              sx={{
                fontFamily: onClick ? "monospace" : undefined,
                overflowWrap: "anywhere",
              }}
            >
              {title}
            </Typography>
          )}
          {adornment}
        </Stack>
      )}
      <Box
        component="dl"
        sx={{
          m: 0,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          columnGap: 2,
          rowGap: 1,
        }}
      >
        {fields.map((f) => (
          <Box
            key={f.label}
            sx={{ minWidth: 0, gridColumn: f.wide ? "1 / -1" : undefined }}
          >
            <Typography component="dt" variant="caption" color="text.primary">
              {f.label}
            </Typography>
            <Typography
              component="dd"
              variant="body2"
              color="text.secondary"
              sx={{
                m: 0,
                fontFamily: f.mono ? "monospace" : undefined,
                overflowWrap: "anywhere",
                whiteSpace: f.wide ? "pre-wrap" : undefined,
              }}
            >
              {f.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  )

  return (
    <Box
      component="li"
      sx={(theme) => ({
        border: 1,
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 1,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.08)
          : "transparent",
        overflow: "hidden",
      })}
    >
      {onClick ? (
        // A div: the row holds block content, which a <button> may not.
        <ButtonBase
          component="div"
          onClick={onClick}
          aria-pressed={selected}
          data-testid={testId}
          sx={{
            display: "flex",
            width: "100%",
            p: 1.5,
            justifyContent: "flex-start",
          }}
        >
          {body}
        </ButtonBase>
      ) : (
        <Box sx={{ p: 1.5 }} data-testid={testId}>
          {body}
        </Box>
      )}
    </Box>
  )
}
