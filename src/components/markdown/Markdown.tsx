import remarkGfm from "remark-gfm"
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

export function MarkdownRender(props: {
  text: string
  plainText?: boolean
  MarkdownProps?: Readonly<Options>
}) {
  const { plainText, MarkdownProps } = props

  return (
    <ReactMarkdown
      {...MarkdownProps}
      children={props.text}
      remarkPlugins={[remarkGfm]}
      components={{
        a({ node, className, children, ...props }) {
          // eslint-disable-next-line react/prop-types
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
            <img {...props} style={{ maxWidth: "100%" }} loading="lazy" />
          )
        },
        ...MarkdownProps?.components,
      }}
    />
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
    ["__", <u key={"__"}>U</u>],
    ["~", <s key={"~"}>S</s>],
  ] as const

  const wrapText = useCallback(
    (char: string) => {
      const current = inputRef.current
      if (current) {
        const start = current.selectionStart
        const end = current.selectionEnd

        if (start && end) {
          const selection = value.slice(start, end)
          let newValue
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
          <ButtonGroup sx={{ color: "inherit" }} color={"primary"}>
            {buttons.map((rep) => (
              <Button
                key={rep[0]}
                value={"i"}
                sx={{ color: "inherit" }}
                onClick={() => wrapText(rep[0])}
              >
                {rep[1]}
              </Button>
            ))}
          </ButtonGroup>

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
            onChange={(event: any) => onChange(event.target.value || "")}
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
