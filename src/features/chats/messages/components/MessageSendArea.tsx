import { HapticIconButton } from "../../../../components/haptic"
import { useTheme, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import SendIcon from "@mui/icons-material/SendRounded"
import { useTranslation } from "react-i18next"
import { useState, useRef, useEffect } from "react"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import useTheme1 from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';

export function MessageSendArea(props: { onSend: (content: string) => void }) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [textEntry, setTextEntry] = useState("")
  const { t } = useTranslation()
  const inputRef = useRef<HTMLDivElement>(null)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const screenHeight = window.screen.height
      setIsKeyboardOpen(viewportHeight < screenHeight * 0.75)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
      return () => {
        window.visualViewport?.removeEventListener("resize", handleResize)
      }
    } else {
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [isMobile])

  const handleSend = () => {
    if (textEntry.trim()) {
      props.onSend(textEntry)
      setTextEntry("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box
      ref={inputRef}
      sx={{
        width: "100%",
        padding: { xs: 1.5, sm: 1 },
        borderTopColor: theme.palette.outline.main,
        boxSizing: "border-box",
        borderWidth: 0,
        borderTop: `solid 1px ${theme.palette.outline.main}`,
        display: "flex",
        flexDirection: "row",
        gap: { xs: 1, sm: 0 },
        bgcolor: theme.palette.background.paper,
        alignItems: { xs: "flex-end", sm: "center" },
        position: isMobile ? "fixed" : "relative",
        bottom: isMobile
          ? isKeyboardOpen
            ? 0
            : "calc(64px + env(safe-area-inset-bottom))"
          : "auto",
        left: isMobile ? 0 : "auto",
        right: isMobile ? 0 : "auto",
        zIndex: isMobile ? theme.zIndex.drawer + 2 : "auto",
        paddingBottom: isMobile
          ? `calc(1.5rem + env(safe-area-inset-bottom))`
          : 1,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={isMobile ? 3 : 4}
        variant={"outlined"}
        size={isMobile ? "small" : "medium"}
        sx={{
          marginRight: { xs: 0, sm: 2 },
          marginBottom: { xs: 0, sm: 0 },
        }}
        value={textEntry}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTextEntry(event.target.value)
        }}
        onKeyPress={handleKeyPress}
        placeholder={t("MessagesBody.typeMessage") || "Type a message..."}
      />
      {isMobile ? (
        <HapticIconButton
          color="primary"
          onClick={handleSend}
          sx={{
            flexShrink: 0,
            alignSelf: "flex-end",
            marginBottom: 0.5,
          }}
        >
          <SendIcon />
        </HapticIconButton>
      ) : (
        <Button
          variant={"contained"}
          color={"primary"}
          sx={{
            maxHeight: 60,
            whiteSpace: "nowrap",
          }}
          onClick={handleSend}
          size="large"
        >
          {t("MessagesBody.send")}
        </Button>
      )}
    </Box>
  )
}
