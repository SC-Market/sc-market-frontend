import { Box, TextField, useTheme, Stack, Button } from "@mui/material"
import { HapticIconButton } from "../../../components/haptic"
import React, { useRef, useState } from "react"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import SendIcon from "@mui/icons-material/SendRounded"
import { LazyDateTimePicker as DateTimePicker } from "../../../components/providers/LazyDateTimePicker"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../../components/mobile"

export function MessageSendAreaMobile(props: {
  onSend: (content: string) => void
  isKeyboardOpen: boolean
  inputRef?: React.RefObject<HTMLDivElement | null>
}) {
  const theme = useTheme<ExtendedTheme>()
  const [textEntry, setTextEntry] = useState("")
  const { t } = useTranslation()
  const localInputRef = useRef<HTMLDivElement>(null)
  const inputRef = props.inputRef || localInputRef

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
        padding: 1.5,
        borderTopColor: theme.palette.outline.main,
        boxSizing: "border-box",
        borderWidth: 0,
        borderTop: `solid 1px ${theme.palette.outline.main}`,
        display: "flex",
        flexDirection: "row",
        gap: 1,
        bgcolor: theme.palette.background.paper,
        alignItems: "flex-end",
        paddingBottom: 2,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={3}
        variant={"outlined"}
        size={"small"}
        value={textEntry}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTextEntry(event.target.value)
        }}
        onKeyPress={handleKeyPress}
        placeholder={t("MessagesBody.typeMessage") || "Type a message..."}
      />
      <HapticIconButton
        aria-label={t("MessagesBody.send", "Send message")}
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
    </Box>
  )
}

export function DateTimePickerBottomSheetMobile(props: {
  open: boolean
  onClose: () => void
  dateTime: Date
  setDateTime: (dateTime: Date) => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { dateTime, setDateTime, open, onClose } = props
  const [pickerOpen, setPickerOpen] = useState(false)

  // Track when picker opens
  const handlePickerOpen = () => {
    setPickerOpen(true)
  }

  // Track when picker closes
  const handlePickerClose = () => {
    setPickerOpen(false)
  }

  // Keep bottom sheet mounted and visible when picker opens
  // The MUI DateTimePicker modal will appear on top with higher z-index
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t("MessagesBody.dateTimePicker", "Date & Time Picker")}
      maxHeight="90vh"
      disableBackdropClose={pickerOpen}
    >
      <Stack spacing={2}>
        <DateTimePicker
          value={dateTime}
          onChange={(newValue) => {
            if (newValue) {
              setDateTime(newValue)
            }
          }}
          onOpen={handlePickerOpen}
          onClose={handlePickerClose}
          slotProps={{
            textField: {
              size: "medium",
              fullWidth: true,
            },
            // Ensure the picker modal appears above the bottom sheet
            dialog: {
              sx: {
                zIndex: theme.zIndex.modal + 10,
              },
            },
          }}
        />

        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `<t:${Math.trunc(dateTime.getTime() / 1000)}:D>`,
              )
            }}
            variant="outlined"
            fullWidth
          >
            {t("MessagesBody.copyDate")}
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `<t:${Math.trunc(dateTime.getTime() / 1000)}:t>`,
              )
            }}
            variant="outlined"
            fullWidth
          >
            {t("MessagesBody.copyTime")}
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  )
}
