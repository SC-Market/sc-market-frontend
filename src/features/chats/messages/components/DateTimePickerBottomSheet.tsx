import { Button, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { LazyDateTimePicker as DateTimePicker } from "../../../../components/providers/LazyDateTimePicker"
import { getTime } from "date-fns"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../../../components/mobile"
import { useState } from "react"

export function DateTimePickerBottomSheet(props: {
  open: boolean
  onClose: () => void
  dateTime: Date
  setDateTime: (dateTime: Date) => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { dateTime, setDateTime, open, onClose } = props
  const [pickerOpen, setPickerOpen] = useState(false)

  const handlePickerOpen = () => {
    setPickerOpen(true)
  }

  const handlePickerClose = () => {
    setPickerOpen(false)
  }

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
