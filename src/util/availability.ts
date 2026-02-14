import type { AvailabilitySelection } from "../hooks/login/UserProfile"
import { generateInitialSelection } from "../components/time/AvailabilitySelector"

export function convertAvailability(availability: AvailabilitySelection[]) {
  const result = generateInitialSelection()

  for (const span of availability) {
    for (let i = span.start; i <= span.finish; i++) {
      result[i] = true
    }
  }

  return result
}
