import { ComponentType, Suspense } from "react"
import { Skeleton } from "@mui/material"
import type { DateTimePickerProps } from "@mui/x-date-pickers"
import { lazyWithRetry } from "../../util/lazyWithRetry"

// The picker AND its LocalizationProvider (DatePickerProvider pulls in the
// date-fns adapter, i.e. date-fns parse/format) load together on first use.
// Importing DatePickerProvider statically put the adapter in the entry bundle,
// since the chat views that use this wrapper are in the entry.
//
// `DateTimePicker` is generic over its date type and its accessible-field DOM
// structure flag. `lazyWithRetry()` cannot carry generics through, so pin it to the
// concrete instantiation this wrapper exposes.
const LocalizedDateTimePicker = lazyWithRetry<ComponentType<DateTimePickerProps<Date>>>(
  () =>
    Promise.all([
      import("./DatePickerProvider"),
      import("@mui/x-date-pickers"),
    ]).then(([{ DatePickerProvider }, { DateTimePicker }]) => ({
      default: function LocalizedDateTimePicker(
        props: DateTimePickerProps<Date>,
      ) {
        return (
          <DatePickerProvider>
            <DateTimePicker {...props} />
          </DatePickerProvider>
        )
      },
    })),
)

export function LazyDateTimePicker(props: DateTimePickerProps<Date>) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <LocalizedDateTimePicker {...props} />
    </Suspense>
  )
}
