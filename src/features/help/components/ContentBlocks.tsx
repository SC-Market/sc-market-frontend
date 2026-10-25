/**
 * Renders compiled Help & Guides content (trusted, first-party Markdown
 * compiled at build time; see ../build/compile.ts). No Markdown parser, no
 * HTML: only the Block/Inline nodes the compiler emits, so user-content
 * sanitizing (components/markdown/Markdown.tsx) stays untouched.
 *
 * - Site links ("/market/cart") are router links in the same tab; https links
 *   open in a new tab.
 * - `> [!TIP]`-style callouts are MUI Alerts; screenshots are figures.
 */
import React, { Fragment } from "react"
import { Alert, AlertTitle, Box, Button, Divider, Link, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import type { Block, CalloutKind, Inline } from "../domain/types"

const CALLOUT_SEVERITY: Record<CalloutKind, "info" | "success" | "warning" | "error"> = {
  note: "info",
  tip: "success",
  important: "info",
  warning: "warning",
  caution: "error",
}

const CALLOUT_LABEL: Record<CalloutKind, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
}

function isInternal(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#")
}

function InlineNodes({ nodes }: { nodes: readonly Inline[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.t) {
          case "text":
            return <Fragment key={i}>{node.v}</Fragment>
          case "strong":
            return (
              <strong key={i}>
                <InlineNodes nodes={node.c} />
              </strong>
            )
          case "em":
            return (
              <em key={i}>
                <InlineNodes nodes={node.c} />
              </em>
            )
          case "del":
            return (
              <del key={i}>
                <InlineNodes nodes={node.c} />
              </del>
            )
          case "code":
            return (
              <Box
                key={i}
                component="code"
                sx={{ px: 0.5, borderRadius: 0.5, bgcolor: "action.hover", fontSize: "0.9em" }}
              >
                {node.v}
              </Box>
            )
          case "br":
            return <br key={i} />
          case "link":
            return isInternal(node.href) && !node.href.startsWith("#") ? (
              <Link key={i} component={RouterLink} to={node.href} color="secondary">
                <InlineNodes nodes={node.c} />
              </Link>
            ) : (
              <Link
                key={i}
                href={node.href}
                color="secondary"
                {...(node.href.startsWith("#") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <InlineNodes nodes={node.c} />
              </Link>
            )
        }
      })}
    </>
  )
}

const HEADING_VARIANT = { 2: "h5", 3: "h6", 4: "subtitle1" } as const

function BlockNode({ block, dense }: { block: Block; dense?: boolean }) {
  switch (block.t) {
    case "p":
      return (
        <Typography variant="body1" component="p" sx={{ mb: dense ? 0.5 : 1.5, "&:last-child": { mb: 0 } }}>
          <InlineNodes nodes={block.c} />
        </Typography>
      )
    case "h":
      return (
        <Typography
          id={block.id}
          variant={HEADING_VARIANT[block.depth]}
          component={`h${block.depth}`}
          sx={{ mt: 3, mb: 1, fontWeight: 700, scrollMarginTop: 80 }}
        >
          <InlineNodes nodes={block.c} />
        </Typography>
      )
    case "ul":
    case "ol":
      return (
        <Box
          component={block.t}
          start={block.t === "ol" && block.start !== 1 ? block.start : undefined}
          sx={{ mt: 0, mb: 1.5, pl: 3, "& > li": { mb: 0.75 } }}
        >
          {block.items.map((item, i) => (
            <Typography key={i} component="li" variant="body1">
              <Blocks blocks={item} dense />
            </Typography>
          ))}
        </Box>
      )
    case "callout":
      return (
        <Alert severity={CALLOUT_SEVERITY[block.kind]} sx={{ mb: 1.5 }} role="note">
          <AlertTitle>{CALLOUT_LABEL[block.kind]}</AlertTitle>
          <Blocks blocks={block.c} dense />
        </Alert>
      )
    case "quote":
      return (
        <Box
          component="blockquote"
          sx={{ m: 0, mb: 1.5, pl: 2, borderLeft: 3, borderColor: "primary.main" }}
        >
          <Blocks blocks={block.c} dense />
        </Box>
      )
    case "img":
      return (
        <Box component="figure" sx={{ m: 0, mb: 2 }}>
          <Box
            component="img"
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            sx={{ display: "block", maxWidth: "100%", height: "auto", borderRadius: 2 }}
          />
          {block.caption && (
            <Typography component="figcaption" variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {block.caption}
            </Typography>
          )}
        </Box>
      )
    case "cta":
      return (
        <Box sx={{ mb: 2 }}>
          {isInternal(block.href) ? (
            <Button variant="contained" component={RouterLink} to={block.href}>
              {block.label}
            </Button>
          ) : (
            <Button variant="contained" href={block.href} target="_blank" rel="noopener noreferrer">
              {block.label}
            </Button>
          )}
        </Box>
      )
    case "code":
      return (
        <Box
          component="pre"
          sx={{ mb: 1.5, p: 1.5, borderRadius: 1, bgcolor: "action.hover", overflowX: "auto" }}
        >
          <code>{block.v}</code>
        </Box>
      )
    case "hr":
      return <Divider sx={{ my: 2 }} />
  }
}

export function Blocks({ blocks, dense }: { blocks: readonly Block[]; dense?: boolean }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockNode key={i} block={block} dense={dense} />
      ))}
    </>
  )
}
