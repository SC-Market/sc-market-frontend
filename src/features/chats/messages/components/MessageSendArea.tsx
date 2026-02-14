import {
  Box,
  Button,
  IconButton,
  TextField,
  useMediaQuery,
} from "@mui/material"
import { HapticIconButton } from "../../../../components/haptic"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import SendIcon from "@mui/icons-material/SendRounded"
import { useTranslation } from "react-i18next"
import { useState, useRef, useEffect } from "react"

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
        paddingBottom: isMobile
          ? `calc(1.5rem + env(safe-area-inset-bottom))`
          : 2,
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
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={isMobile ? 3 : 4}
        variant={"outlined"}
        size="small"
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
