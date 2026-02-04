import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import ReactMarkdown, { Options } from "react-markdown"
import React, { useCallback } from "react"
import { UnderlineLink } from "../typography/UnderlineLink"
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Link,
  Paper,
  TextField,
  TextFieldProps,
  Toolbar,
  Typography,
} from "@mui/material"
import YouTube from "react-youtube"
import { useTheme } from "@mui/material/styles"
import { SxProps } from "@mui/system"

const allowList = [
  "robertsspaceindustries.com",
  "starcitizen.tools",
  "i.imgur.com",
  // 'media.discordapp.net',
  // 'cdn.discordapp.com',
]

// Ultra-secure sanitization schema - minimal attributes only
const sanitizeSchema = {
  tagNames: [
    // Basic formatting
    "u",
    "s",
    "small",
    "sub",
    "sup",
    // Safe structural elements
    "div",
    "span",
    "p",
    "br",
    // Lists (already handled by markdown, but allow for HTML)
    "ul",
    "ol",
    "li",
    // Headings (already handled by markdown, but allow for HTML)
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    // Text formatting (already handled by markdown, but allow for HTML)
    "strong",
    "em",
    "b",
    "i",
    "code",
    "pre",
    // Links and media (minimal attributes only)
    "a",
    "img",
    // Tables (from GFM)
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    // Blockquotes
    "blockquote",
    // Horizontal rule
    "hr",
  ],
  attributes: {
    // Only allow href on links (no target, rel, title, etc.)
    a: ["href"],
    // Only allow src and alt on images (no width, height, title, etc.)
    img: ["src", "alt"],
    // No other attributes allowed on any other elements
  },
  protocols: {
    // Only allow safe protocols
    href: ["http", "https"],
    src: ["http", "https"],
  },
}

export function MarkdownRender(props: {
  text: string
  plainText?: boolean
  MarkdownProps?: Readonly<Options>
}) {
  const { plainText, MarkdownProps } = props

  return (
    <ReactMarkdown
      {...MarkdownProps}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      components={{
        // Fix paragraph spacing
        p({ children }) {
          return (
            <Typography
              variant="body2"
              component="p"
              sx={{
                margin: 0,
                marginBottom: 0.5,
                "&:last-child": { marginBottom: 0 },
              }}
            >
              {children}
            </Typography>
          )
        },
        // Fix heading spacing
        h1({ children }) {
          return (
            <Typography
              variant="h5"
              component="h1"
              sx={{
                margin: 0,
                marginBottom: 1,
                marginTop: 1,
                "&:first-child": { marginTop: 0 },
              }}
            >
              {children}
            </Typography>
          )
        },
        h2({ children }) {
          return (
            <Typography
              variant="h6"
              component="h2"
              sx={{
                margin: 0,
                marginBottom: 0.75,
                marginTop: 0.75,
                "&:first-child": { marginTop: 0 },
              }}
            >
              {children}
            </Typography>
          )
        },
        h3({ children }) {
          return (
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                margin: 0,
                marginBottom: 0.5,
                marginTop: 0.5,
                "&:first-child": { marginTop: 0 },
              }}
            >
              {children}
            </Typography>
          )
        },
        // Fix list spacing
        ul({ children }) {
          return (
            <Box
              component="ul"
              sx={{ margin: 0, marginBottom: 0.5, paddingLeft: 2 }}
            >
              {children}
            </Box>
          )
        },
        ol({ children }) {
          return (
            <Box
              component="ol"
              sx={{ margin: 0, marginBottom: 0.5, paddingLeft: 2 }}
            >
              {children}
            </Box>
          )
        },
        li({ children }) {
          return (
            <Typography
              component="li"
              variant="body2"
              sx={{ marginBottom: 0.25 }}
            >
              {children}
            </Typography>
          )
        },
        // Fix blockquote spacing
        blockquote({ children }) {
          return (
            <Box
              component="blockquote"
              sx={{
                borderLeft: 3,
                borderColor: "primary.main",
                paddingLeft: 2,
                margin: 0,
                marginBottom: 0.5,
                fontStyle: "italic",
                backgroundColor: "action.hover",
                padding: 1,
                borderRadius: 1,
              }}
            >
              {children}
            </Box>
          )
        },

        a({ node, className, children, ...props }) {
          const href = props.href
          if (href) {
            try {
              const url = new URL(href)
              if (url.origin.includes("youtube.com") && !plainText) {
                return <YouTube videoId={url.searchParams.get("v")!} />
              }
            } catch (e) {
              console.error(e)
            }
          }

          return (
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={href}
              sx={{ display: "inline" }}
            >
              <UnderlineLink color={"secondary"}>{children}</UnderlineLink>
            </Link>
          )
        },
        img({ node, className, children, ...props }) {
          const src = props.src

          if (src) {
            const url = new URL(src)
            let allowed = false
            for (const domain of allowList) {
              if (url.origin.includes(domain)) {
                allowed = true
                break
              }
            }

            if (!allowed) {
              return null
            }
          }

          return plainText ? null : (
            <img
              {...props}
              style={{ maxWidth: "100%" }}
              loading="lazy"
              alt={props.alt || "Image from markdown content"}
            />
          )
        },
        ...MarkdownProps?.components,
      }}
    >
      {props.text}
    </ReactMarkdown>
  )
}

export function MarkdownEditor(props: {
  value: string
  onChange: (newValue: string) => void
  TextFieldProps?: TextFieldProps
  noPreview?: boolean
  sx?: SxProps
  BarItems?: React.ReactNode
  variant?: "horizontal" | "vertical"
}) {
  const { value, onChange, variant, TextFieldProps, noPreview, sx, BarItems } =
    props

  const theme = useTheme()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const buttons = [
    ["*", <i key={"*"}>I</i>],
    ["**", <b key={"**"}>B</b>],
    ["<u>", <u key={"<u>"}>U</u>],
    ["<s>", <s key={"<s>"}>S</s>],
    ["`", <code key={"`"}>C</code>],
    ["<small>", <small key={"<small>"}>S</small>],
    ["<sub>", <sub key={"<sub>"}>↓</sub>],
    ["<sup>", <sup key={"<sup>"}>↑</sup>],
    ["# ", <span key={"#"}>H1</span>],
    ["## ", <span key={"##"}>H2</span>],
    ["- ", <span key={"-"}>•</span>],
    ["> ", <span key={">"}>&quot;</span>],
  ] as const

  const wrapText = useCallback(
    (char: string) => {
      const current = inputRef.current
      if (current) {
        const start = current.selectionStart
        const end = current.selectionEnd

        if (start !== null && end !== null) {
          const selection = value.slice(start, end)
          let newValue

          // Handle line-based formatting (headers, lists, blockquotes)
          if (char.endsWith(" ")) {
            const lines = value.split("\n")
            const currentLineIndex =
              value.slice(0, start).split("\n").length - 1
            const currentLine = lines[currentLineIndex] || ""

            if (currentLine.startsWith(char)) {
              // Remove formatting
              lines[currentLineIndex] = currentLine.slice(char.length)
            } else {
              // Add formatting
              lines[currentLineIndex] = char + currentLine
            }

            newValue = lines.join("\n")
            onChange(newValue)

            // Set cursor position
            const newStart =
              newValue.slice(0, start).length +
              (currentLine.startsWith(char) ? -char.length : char.length)
            setTimeout(() => {
              current.setSelectionRange(newStart, newStart)
            }, 0)
          } else if (char.startsWith("<") && char.endsWith(">")) {
            // Handle HTML tags like <u>
            const tagName = char.slice(1, -1) // Extract tag name (e.g., "u" from "<u>")
            const closingTag = `</${tagName}>`

            if (selection.startsWith(char) && selection.endsWith(closingTag)) {
              // Remove HTML tags
              newValue = selection.slice(
                char.length,
                selection.length - closingTag.length,
              )
            } else {
              // Add HTML tags
              newValue = char + selection + closingTag
            }

            current.focus()
            document.execCommand("insertText", false, newValue)
            if (start === end) {
              current.setSelectionRange(start + char.length, end + char.length)
            } else {
              current.setSelectionRange(
                start,
                end + char.length + closingTag.length,
              )
            }
          } else {
            // Handle inline markdown formatting
            if (selection.startsWith(char) && selection.endsWith(char)) {
              newValue = selection.slice(
                char.length,
                selection.length - char.length,
              )
            } else {
              newValue = char + selection + char
            }

            current.focus()
            document.execCommand("insertText", false, newValue)
            if (start === end) {
              current.setSelectionRange(start + char.length, end + char.length)
            } else {
              current.setSelectionRange(start, end + char.length * 2)
            }
          }
        }
      }
    },
    [inputRef, value, onChange],
  )

  return (
    <Paper sx={sx}>
      <AppBar position="static">
        <Toolbar
          variant={"dense"}
          sx={{
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 1,
            paddingRight: 1,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            <ButtonGroup
              size="small"
              sx={{ color: "inherit" }}
              color={"primary"}
            >
              {buttons.slice(0, 5).map((rep) => (
                <Button
                  key={rep[0]}
                  sx={{ color: "inherit", minWidth: 32 }}
                  onClick={() => wrapText(rep[0])}
                  title={`Format as ${rep[0]}`}
                >
                  {rep[1]}
                </Button>
              ))}
            </ButtonGroup>
            <ButtonGroup
              size="small"
              sx={{ color: "inherit" }}
              color={"primary"}
            >
              {buttons.slice(5, 8).map((rep) => (
                <Button
                  key={rep[0]}
                  sx={{ color: "inherit", minWidth: 32 }}
                  onClick={() => wrapText(rep[0])}
                  title={`Format as ${rep[0]}`}
                >
                  {rep[1]}
                </Button>
              ))}
            </ButtonGroup>
            <ButtonGroup
              size="small"
              sx={{ color: "inherit" }}
              color={"primary"}
            >
              {buttons.slice(8).map((rep) => (
                <Button
                  key={rep[0]}
                  sx={{ color: "inherit", minWidth: 32 }}
                  onClick={() => wrapText(rep[0])}
                  title={`Format as ${rep[0]}`}
                >
                  {rep[1]}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {BarItems}
        </Toolbar>
      </AppBar>

      <Box
        display={"flex"}
        flexDirection={variant === "vertical" ? "column" : undefined}
      >
        <Box sx={{ padding: 1, flexGrow: 1, minWidth: "40%" }}>
          <TextField
            multiline
            fullWidth
            minRows={10}
            value={value}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              onChange(event.target.value || "")
            }
            helperText={"Markdown enabled"}
            inputRef={inputRef}
            {...TextFieldProps}
          />
        </Box>
        <Box
          minWidth={"60%"}
          sx={{ padding: 1, display: noPreview ? "none" : undefined }}
        >
          <Paper sx={{ padding: 1, minHeight: "calc(100% - 23px)" }}>
            <MarkdownRender text={props.value} />
          </Paper>
        </Box>
      </Box>
    </Paper>
  )
}
