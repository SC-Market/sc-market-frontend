import React from "react"
import { useSession } from "../../hooks/login/useSession"
import { LandingHeroLayout } from "./LandingHeroLayout"
import { landingSellHref } from "./LandingHero"

/**
 * The hero while the homepage chunk loads: the real layout, with the two
 * stat numbers as same-line skeletons.
 */
export function LandingHeroSkeleton() {
  const session = useSession()
  return (
    <LandingHeroLayout
      stats={undefined}
      sellHref={landingSellHref(session.status === "authenticated")}
    />
  )
}
