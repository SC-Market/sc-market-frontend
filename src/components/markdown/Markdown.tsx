import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import ReactMarkdown, { Options } from "react-markdown"
import React, { useCallback } from "react"
import { UnderlineLink } from "../typography/UnderlineLink"
import { YouTubeFacade } from "../embeds/YouTubeFacade"
import { useTheme } from "@mui/material/styles"
import { SxProps } from "@mui/system"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/BoxProps';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import useTheme1 from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/FabProps';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextFieldProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { BreadcrumbsProps } from '@mui/material/BreadcrumbsProps';
import MaterialLink from '@mui/material/Link';
import { TypographyProps } from '@mui/material/TypographyProps';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { GridProps } from '@mui/material/Grid';
import { PaperProps } from '@mui/material/PaperProps';
import CardActions from '@mui/material/CardActions';
import ListItemButton from '@mui/material/ListItemButton';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';
import MuiRating from '@mui/material/Rating';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import { Theme } from '@mui/material/styles';
import ButtonGroup from '@mui/material/ButtonGroup';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import FilterList from '@mui/icons-material/FilterList';
import AddRounded from '@mui/icons-material/AddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import MessageRounded from '@mui/icons-material/MessageRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuRounded from '@mui/icons-material/MenuRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import Info from '@mui/icons-material/Info';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import GetAppRounded from '@mui/icons-material/GetAppRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Person from '@mui/icons-material/Person';
import Business from '@mui/icons-material/Business';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import AutoGraphOutlined from '@mui/icons-material/AutoGraphOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import WhatshotRounded from '@mui/icons-material/WhatshotRounded';
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded';
import RocketLaunchRounded from '@mui/icons-material/RocketLaunchRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';

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
                const videoId = url.searchParams.get("v")
                if (videoId) {
                  return <YouTubeFacade videoId={videoId} />
                }
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
