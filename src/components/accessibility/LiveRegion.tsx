import React, { useEffect, useRef } from "react"
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface LiveRegionProps {
  message: string
  "aria-live"?: "polite" | "assertive" | "off"
  "aria-atomic"?: boolean
  "aria-relevant"?:
    | "additions"
    | "additions removals"
    | "additions text"
    | "all"
    | "removals"
    | "removals additions"
    | "removals text"
    | "text"
    | "text additions"
    | "text removals"
  className?: string
}

export function LiveRegion({
  message,
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = true,
  "aria-relevant": ariaRelevant = "all",
  className,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message && regionRef.current) {
      // Trigger a screen reader announcement
      regionRef.current.textContent = message
    }
  }, [message])

  return (
    <Box
      ref={regionRef}
      className={`${className || ""} sr-only`}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      role="status"
    />
  )
}

// Specialized live region components
export function StatusLiveRegion({ message }: { message: string }) {
  return (
    <LiveRegion
      message={message}
      aria-live="polite"
      aria-atomic={true}
      aria-relevant="all"
    />
  )
}

export function AlertLiveRegion({ message }: { message: string }) {
  return (
    <LiveRegion
      message={message}
      aria-live="assertive"
      aria-atomic={true}
      aria-relevant="all"
    />
  )
}

export function LogLiveRegion({ message }: { message: string }) {
  return (
    <LiveRegion
      message={message}
      aria-live="polite"
      aria-atomic={false}
      aria-relevant="additions"
    />
  )
}
