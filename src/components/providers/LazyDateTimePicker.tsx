import { ComponentType, lazy, Suspense } from "react"
import { Skeleton } from "@mui/material"
import type { DateTimePickerProps } from "@mui/x-date-pickers"
import { DatePickerProvider } from "./DatePickerProvider"

// `DateTimePicker` is generic over its date type and its accessible-field DOM
// structure flag. `lazy()` cannot carry generics through, so pin it to the
// concrete instantiation this wrapper exposes.
const DateTimePicker = lazy<ComponentType<DateTimePickerProps<Date>>>(() =>
  import("@mui/x-date-pickers").then((m) => ({
    default: m.DateTimePicker,
  })),
)

export function LazyDateTimePicker(props: DateTimePickerProps<Date>) {
  return (
    <DatePickerProvider>
      <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
        <DateTimePicker {...props} />
      </Suspense>
    </DatePickerProvider>
  )
}
