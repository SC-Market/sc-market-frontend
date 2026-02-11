import { RefObject, useEffect, useMemo, useState } from "react"

import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export function useOnScreen(
  ref?: RefObject<HTMLElement | null> | null,
): boolean {
  if (!ref) {
    return false
  }

  const [isIntersecting, setIntersecting] = useState(false)

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting),
      ),
    [ref],
  )

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [])

  return isIntersecting
}
