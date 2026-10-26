import React from "react"
import { useSession } from "../../hooks/login/useSession"
import { LandingHeroLayout } from "./LandingHeroLayout"

export function LandingHero() {
  const session = useSession()
  return (
    <LandingHeroLayout
      signIn={
        session.status === "authenticated"
          ? "none"
          : session.status === "anonymous"
            ? "card"
            : "placeholder"
      }
    />
  )
}
