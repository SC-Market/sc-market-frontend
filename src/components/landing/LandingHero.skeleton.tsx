import React from "react"
import { useSession } from "../../hooks/login/useSession"
import { LandingHeroLayout } from "./LandingHeroLayout"

/**
 * The hero while the homepage loads: the real layout, with the stat numbers
 * and the latest listings rows as same-size skeletons.
 */
export function LandingHeroSkeleton() {
  const session = useSession()
  return (
    <LandingHeroLayout
      stats={undefined}
      liveListings={undefined}
      listings={undefined}
      signedIn={session.status === "authenticated"}
    />
  )
}
