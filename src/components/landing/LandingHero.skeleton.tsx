import React from "react"
import { useSession } from "../../hooks/login/useSession"
import { LandingHeroLayout } from "./LandingHeroLayout"

/**
 * The hero while the homepage loads: the real layout, with the stat numbers
 * and the buy-order rows as same-size skeletons.
 */
export function LandingHeroSkeleton() {
  const session = useSession()
  return (
    <LandingHeroLayout
      stats={undefined}
      liveListings={undefined}
      buyOrders={undefined}
      signedIn={session.status === "authenticated"}
    />
  )
}
