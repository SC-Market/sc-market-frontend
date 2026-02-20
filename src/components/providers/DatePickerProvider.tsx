import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { enUS, uk, zhCN } from "date-fns/locale"
import { useTranslation } from "react-i18next"

const dateFnsLocales = {
  en: enUS,
  uk: uk,
  "zh-CN": zhCN,
}

export function DatePickerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { i18n } = useTranslation()

  return (
    <LocalizationProvider
      key={i18n.language}
      dateAdapter={AdapterDateFns}
      adapterLocale={
        dateFnsLocales[i18n.language as keyof typeof dateFnsLocales] || enUS
      }
    >
      {children}
    </LocalizationProvider>
  )
}
