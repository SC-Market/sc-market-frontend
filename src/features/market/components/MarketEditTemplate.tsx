import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { FlatSection } from "../../../components/paper/Section"
import { MarkdownEditor } from "../../../components/markdown/Markdown"
import React, { useCallback, useEffect, useState } from "react"
import {
  useGetUserProfileQuery,
  useUpdateProfile,
} from "../../../store/profile"
import { Grid, Typography } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useUpdateContractorMutation } from "../../../store/contractor"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next" // Localization
import { OrderSettings } from "../../../components/settings/OrderSettings"

export function MarketEditTemplate(props: { org?: boolean }) {
  const { t } = useTranslation() // Localization hook

  const [contractor] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()

  const [template, setTemplate] = useState("")

  useEffect(() => {
    setTemplate(
      (props.org
        ? contractor?.market_order_template
        : profile?.market_order_template) || "",
    )
  }, [contractor, props.org, profile])

  const [updateProfile, { isLoading: profileUpdateLoading }] =
    useUpdateProfile()
  const [updateOrg, { isLoading: orgUpdateLoading }] =
    useUpdateContractorMutation()

  const issueAlert = useAlertHook()

  const callback = useCallback(() => {
    let response
    if (props.org) {
      response = updateOrg({
        contractor: contractor!.spectrum_id,
        body: {
          market_order_template: template,
        },
      })
    } else {
      response = updateProfile({
        market_order_template: template,
      })
    }

    response
      .unwrap()
      .then((res) => {
        issueAlert({
          severity: "success",
          message: t("MarketEditTemplate.submitted"),
        })
      })
      .catch((err) => issueAlert(err))
  }, [template, contractor, t, props.org, updateOrg, updateProfile, issueAlert])

  return (
    <>
      <Grid item xs={12}>
        <FlatSection title={t("MarketEditTemplate.title")}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t("MarketEditTemplate.configure")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <MarkdownEditor value={template} onChange={setTemplate} />
          </Grid>
          <Grid item xs={12}>
            <LoadingButton
              loading={orgUpdateLoading || profileUpdateLoading}
              onClick={callback}
              variant={"contained"}
              disabled={props.org && !contractor}
            >
              {t("MarketEditTemplate.submit")}
            </LoadingButton>
          </Grid>
        </FlatSection>
      </Grid>

      {/* Order Settings Section */}
      <OrderSettings
        entityType={props.org ? "contractor" : "user"}
        entityId={props.org ? contractor?.spectrum_id : undefined}
      />
    </>
  )
}
