import { lazy, Suspense } from "react"
import { Skeleton } from "@mui/material"
import type { DateTimePickerProps } from "@mui/x-date-pickers"
import { DatePickerProvider } from "./DatePickerProvider"

const DateTimePicker = lazy(() =>
  import("@mui/x-date-pickers").then((m) => ({
    default: m.DateTimePicker,
  }))
)

export function LazyDateTimePicker(props: DateTimePickerProps<Date>) {
  return (
    <DatePickerProvider>
      <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
        <DateTimePicker {...(props as any)} />
      </Suspense>
    </DatePickerProvider>
  )
}
