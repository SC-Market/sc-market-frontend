import React, { useState } from "react"
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
}) {
  const [open, setOpen] = useState(false)
  const { question, answer, last, first } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
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
      <Collapse in={open} timeout="auto" unmountOnExit>
        <ListItem>
          <Typography color={"text.secondary"} variant={"body1"}>
            <MarkdownRender text={answer} />
          </Typography>
        </ListItem>
      </Collapse>
      {!last && <Divider light />}
    </>
  )
}
