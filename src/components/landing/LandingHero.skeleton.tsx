import React from "react"
import { useSession } from "../../hooks/login/useSession"
import { LandingHeroLayout } from "./LandingHeroLayout"

/**
 * The hero while the homepage chunk loads: the real layout, with the sign-in
 * card held by a same-size placeholder unless the visitor is signed in.
 */
export function LandingHeroSkeleton() {
  const session = useSession()
  return (
    <LandingHeroLayout
      signIn={session.status === "authenticated" ? "none" : "placeholder"}
    />
  )
}
