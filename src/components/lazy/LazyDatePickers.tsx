import React, { lazy, Suspense } from "react"
import CircularProgress from "@mui/material/CircularProgress"
import Box from "@mui/material/Box"

const DateTimePicker = lazy(() =>
  import("@mui/x-date-pickers/DateTimePicker").then((module) => ({
    default: module.DateTimePicker,
  }))
)

const DatePicker = lazy(() =>
  import("@mui/x-date-pickers/DatePicker").then((module) => ({
    default: module.DatePicker,
  }))
)

const Fallback = () => (
  <Box display="flex" justifyContent="center" p={2}>
    <CircularProgress size={24} />
  </Box>
)

export function LazyDateTimePicker(props: React.ComponentProps<typeof DateTimePicker>) {
  return (
    <Suspense fallback={<Fallback />}>
      <DateTimePicker {...props} />
    </Suspense>
  )
}

export function LazyDatePicker(props: React.ComponentProps<typeof DatePicker>) {
  return (
    <Suspense fallback={<Fallback />}>
      <DatePicker {...props} />
    </Suspense>
  )
}
