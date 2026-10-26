import React from "react"
import { Link as MuiLink, Typography } from "@mui/material"
import { Trans } from "react-i18next"
import { LEGAL_PATHS } from "../../routes/paths"

/**
 * "By signing in (up), you agree to our Terms of Service and Privacy Policy."
 * Plain hrefs: the legal pages are static HTML, not SPA routes.
 */
export function LegalAgreementNotice(props: { action?: "signin" | "signup" }) {
  const signUp = props.action === "signup"
  return (
    <Typography variant="body2" color="text.secondary">
      <Trans
        i18nKey={signUp ? "auth.legalAgreementSignUp" : "auth.legalAgreement"}
        defaults={
          signUp
            ? "By signing up, you agree to our <termsLink>Terms of Service</termsLink> and <privacyLink>Privacy Policy</privacyLink>."
            : "By signing in, you agree to our <termsLink>Terms of Service</termsLink> and <privacyLink>Privacy Policy</privacyLink>."
        }
        components={{
          termsLink: <MuiLink href={LEGAL_PATHS.terms} />,
          privacyLink: <MuiLink href={LEGAL_PATHS.privacy} />,
        }}
      />
    </Typography>
  )
}
