import React, { Suspense, useState } from "react"
import { Box, Collapse, Divider, ListItem, ListItemButton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import { MarkdownRender } from "../markdown/Markdown.lazy"
import { LandingBlockTitle, LandingBodyText } from "./LandingTypography"

/**
 * Collapsible FAQ question component
 * Extracted from LandingPage to prevent circular dependencies
 */
export function FAQQuestion(props: {
  question: React.ReactNode
  answer: string
  last?: boolean
  first?: boolean
  /**
   * Keep the collapsed answer in the DOM as text (for crawlers and in-page
   * search) instead of mounting it only when opened.
   */
  keepMounted?: boolean
}) {
  const [open, setOpen] = useState(false)
  // Load the markdown renderer only once the answer is first opened; until
  // then a kept-mounted answer is plain text.
  const [opened, setOpened] = useState(false)
  const { question, answer, last, first, keepMounted } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      {/* Each question is an <h3> holding its toggle button (the accordion
          pattern), so the heading survives in the outline; the landing
          FAQ's section <h2> sits above it, as in the edge bridge's markup. */}
      <LandingBlockTitle bold={false} sx={{ textAlign: "left", margin: 0 }}>
        <ListItemButton
          component={"button"}
          aria-expanded={open}
          onClick={() => {
            setOpen(!open)
            setOpened(true)
          }}
          sx={{
            width: "100%",
            font: "inherit",
            color: "inherit",
            textAlign: "inherit",
            ...(first
              ? {
                  borderTopLeftRadius: theme.spacing(0.5),
                  borderTopRightRadius: theme.spacing(0.5),
                }
              : {}),
            ...(last
              ? {
                  borderBottomLeftRadius: theme.spacing(0.5),
                  borderBottomRightRadius: theme.spacing(0.5),
                }
              : {}),
          }}
        >
          <Box component={"span"} sx={{ flex: "1 1 auto", marginY: 0.75 }}>
            {question}
          </Box>
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </LandingBlockTitle>
      <Collapse in={open} timeout="auto" unmountOnExit={!keepMounted}>
        {/* A div: the containing List is a div too (an <h3> can't be a <ul>
            child), so an <li> here would be an orphan list item. */}
        <ListItem component="div">
          <LandingBodyText
            sx={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              width: "100%",
            }}
          >
            {opened ? (
              <Suspense fallback={answer}>
                <MarkdownRender text={answer} />
              </Suspense>
            ) : (
              answer
            )}
          </LandingBodyText>
        </ListItem>
      </Collapse>
      {!last && <Divider light />}
    </>
  )
}
