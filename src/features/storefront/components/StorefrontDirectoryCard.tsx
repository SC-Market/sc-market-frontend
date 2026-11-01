import React from "react"
import { Alert, Box, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import type { StorefrontDirectoryStatus } from "../../../store/api/v2/market"
import { getErrorMessage } from "../../../util/errorHandling"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { SerializedError } from "@reduxjs/toolkit"

/**
 * "Show in the public storefront directory" (the /storefronts hub and the
 * homepage row), for an org or a shop, with why it is or isn't listed.
 * Forced off while members-only.
 */
export function StorefrontDirectoryCard(props: {
  kind: "org" | "shop"
  status: StorefrontDirectoryStatus
  saving: boolean
  error?: FetchBaseQueryError | SerializedError
  onChange: (show: boolean) => void
  /** Without its own paper and title (inside a settings section that has them). */
  bare?: boolean
}) {
  const { t } = useTranslation()
  const { status } = props

  const reason = (() => {
    switch (status.reason) {
      case "listed":
        return props.kind === "org"
          ? t("storefront.directory.listed", "Your org is listed in the storefront directory.")
          : t("storefront.directory.shopListed", "This shop counts towards its org's listing in the storefront directory.")
      case "hidden_by_setting":
        return t("storefront.directory.hidden", "Hidden: it isn't shown in the storefront directory.")
      case "members_only":
        return t(
          "storefront.directory.membersOnly",
          "Members-only storefronts are never listed publicly. Your branded subdomain still works for your members.",
        )
      case "no_public_content":
        return status.private_listings > 0
          ? t("storefront.directory.onlyPrivate", {
              listings: status.private_listings,
              defaultValue: "Not listed yet: only members-only listings ({{listings}}). It shows once it has a public listing.",
            })
          : t("storefront.directory.noContent", "Not listed yet: it shows once it has a public listing.")
      case "not_verified":
        return t("storefront.directory.notVerified", "Only RSI-verified orgs are listed in the storefront directory.")
      case "personal_shop":
        return t("storefront.directory.personalShop", "The storefront directory lists orgs, so personal shops aren't in it yet.")
      case "org_not_listed":
        return t("storefront.directory.orgNotListed", "Its org isn't listed in the storefront directory, so neither is this shop.")
    }
  })()

  return (
    <Box component={props.bare ? "div" : Paper} sx={props.bare ? undefined : { p: 2 }} data-testid="storefront-directory">
      <Stack spacing={1}>
        {!props.bare && (
          <Typography variant="h6" component="h2" color="text.secondary">
            {t("storefront.directory.title", "Storefront directory")}
          </Typography>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={status.show_in_directory}
              disabled={!status.can_change || props.saving}
              onChange={(e) => props.onChange(e.target.checked)}
              inputProps={{ "aria-describedby": "storefront-directory-reason" }}
              data-testid="storefront-directory-toggle"
            />
          }
          label={t("storefront.directory.toggle", "Show in the public storefront directory")}
        />
        <Typography id="storefront-directory-reason" variant="body2" color="text.primary">
          {reason}
        </Typography>
        {props.error && (
          <Alert severity="error">
            {getErrorMessage(props.error) ?? t("storefront.directory.saveFailed", "The setting couldn't be saved.")}
          </Alert>
        )}
      </Stack>
    </Box>
  )
}
