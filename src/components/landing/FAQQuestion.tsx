import React, { Suspense, useState } from "react"
import {
  Collapse,
  Divider,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import { MarkdownRender } from "../markdown/Markdown.lazy"

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
      <ListItemButton
        onClick={() => {
          setOpen(!open)
          setOpened(true)
        }}
        sx={{
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
        <ListItemText>
          <Typography variant={"h5"} color={"text.secondary"}>
            {question}
          </Typography>
        </ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit={!keepMounted}>
        <ListItem>
          <Typography
            color={"text.secondary"}
            variant={"body1"}
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
          </Typography>
        </ListItem>
      </Collapse>
      {!last && <Divider light />}
    </>
  )
}
