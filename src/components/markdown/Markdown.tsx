import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import ReactMarkdown, { Options } from "react-markdown"
import React, { useCallback } from "react"
import { useTranslation } from "react-i18next"
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
import { YouTubeFacade } from "../embeds/YouTubeFacade"
import { SxProps } from "@mui/system"
import {
  imageHostAllowed,
  sanitizeSchema,
  youTubeVideoId,
  paragraphHasBlock,
} from "./markdownSchema"

export function MarkdownRender(props: {
  text: string
  plainText?: boolean
  MarkdownProps?: Readonly<Options>
}) {
  const { plainText, MarkdownProps } = props
  const { t } = useTranslation()

  return (
    <ReactMarkdown
      {...MarkdownProps}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      components={{
        // Fix paragraph spacing
        p({ node, children }) {
          return (
            <Typography
              variant="body2"
              component={!plainText && paragraphHasBlock(node) ? "div" : "p"}
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
        // Fix heading spacing. User content is never the page's title: its
        // headings are one level down (# -> h2), so a page keeps one h1.
        h1({ children }) {
          return (
            <Typography
              variant="h5"
              component="h2"
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
              component="h3"
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
              component="h4"
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

        a({ href, children }) {
          const videoId = plainText ? null : youTubeVideoId(href)
          if (videoId) {
            return <YouTubeFacade videoId={videoId} />
          }

          return (
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={href}
              sx={{ display: "inline" }}
            >
              {/* A span: the link sits inside a paragraph, and a <p> in a
                  <p> splits it when the HTML is parsed (server-rendered
                  pages then fail to hydrate). */}
              <UnderlineLink component="span">{children}</UnderlineLink>
            </Link>
          )
        },
        img({ src, alt, title, width, height }) {
          // Images only from the allow list; relative or malformed src too.
          if (src && !imageHostAllowed(src)) {
            return null
          }

          return plainText ? null : (
            <img
              src={src}
              title={title}
              width={width}
              height={height}
              style={{ maxWidth: "100%" }}
              loading="lazy"
              alt={alt || t("appUi.markdown.imageAlt")}
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

  const { t } = useTranslation()
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
              sx={{ color: "text.primary" }}
              color={"primary"}
            >
              {buttons.slice(0, 5).map((rep) => (
                <Button
                  key={rep[0]}
                  sx={{ color: "text.primary", minWidth: 32 }}
                  onClick={() => wrapText(rep[0])}
                  title={t("appUi.markdown.formatAs", { syntax: rep[0] })}
                >
                  {rep[1]}
                </Button>
              ))}
            </ButtonGroup>
            <ButtonGroup
              size="small"
              sx={{ color: "text.primary" }}
              color={"primary"}
            >
              {buttons.slice(5, 8).map((rep) => (
                <Button
                  key={rep[0]}
                  sx={{ color: "text.primary", minWidth: 32 }}
                  onClick={() => wrapText(rep[0])}
                  title={t("appUi.markdown.formatAs", { syntax: rep[0] })}
                >
                  {rep[1]}
                </Button>
              ))}
            </ButtonGroup>
            <ButtonGroup
              size="small"
              sx={{ color: "text.primary" }}
              color={"primary"}
            >
              {buttons.slice(8).map((rep) => (
                <Button
                  key={rep[0]}
                  sx={{ color: "text.primary", minWidth: 32 }}
                  onClick={() => wrapText(rep[0])}
                  title={t("appUi.markdown.formatAs", { syntax: rep[0] })}
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
            helperText={t("appUi.markdown.enabled")}
            inputRef={inputRef}
            // A name for the bare editor; pages override it via TextFieldProps
            // (label or inputProps) with what the text is for.
            inputProps={{ "aria-label": t("appUi.markdown.textAria") }}
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
