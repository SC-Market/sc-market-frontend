/**
 * "N listings were paused by the wipe on <date>" with Relist all
 * (backend services/listing-wipe, GET/POST /wipe-relist).
 *
 * The backend decides what counts: the latest wipe's listings that are still
 * paused, not relisted, in shops the user can manage (canManageShop). Relist
 * all renews each one (back on the market, ranks as fresh). Nothing is shown
 * when there is nothing to relist, so running it twice is harmless.
 *
 * shopId: only that shop (its Listings page); otherwise every shop the user
 * manages (My Listings).
 */
import React from "react"
import { Alert, AlertTitle, Button, CircularProgress } from "@mui/material"
import { RestartAltRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useWipeRelist } from "../../hooks/useWipeRelist"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useFormatters } from "../../../../util/format"

export function WipeRelistBanner(props: { shopId?: string }) {
  const { shopId } = props
  const { t } = useTranslation()
  const fmt = useFormatters()
  const issueAlert = useAlertHook()
  const {
    summary: data,
    relistAll,
    isRelisting: isLoading,
  } = useWipeRelist(shopId)

  if (!data || data.count <= 0) return null

  const onRelist = async () => {
    try {
      const relisted = await relistAll(data)
      issueAlert(
        relisted > 0
          ? {
              message: t("wipeRelist.done", { count: relisted }),
              severity: "success",
            }
          : { message: t("wipeRelist.nothing"), severity: "info" },
      )
    } catch {
      issueAlert({ message: t("wipeRelist.failed"), severity: "error" })
    }
  }

  return (
    <Alert
      severity="info"
      variant="outlined"
      icon={<RestartAltRounded />}
      sx={{ mb: 2, alignItems: "center" }}
      action={
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={onRelist}
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {t("wipeRelist.button")}
        </Button>
      }
    >
      <AlertTitle sx={{ mb: 0 }}>
        {t("wipeRelist.title", {
          count: data.count,
          date: fmt.date(data.ran_at, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        })}
      </AlertTitle>
      {t("wipeRelist.hint")}
    </Alert>
  )
}
