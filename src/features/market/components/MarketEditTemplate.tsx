import { FlatSection } from "../../../components/paper/Section"
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy"
import React, { useCallback, useEffect, useState } from "react"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { Grid, Typography } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useGetContractorBySpectrumIDQuery } from "../../contractor/api/contractorApi"
import { useSaveMarketOrderTemplate } from "../hooks/useSaveMarketOrderTemplate"
import { useTranslation } from "react-i18next" // Localization
import { OrderSettings } from "../../../components/settings/OrderSettings"

export function MarketEditTemplate(props: {
  org?: boolean
  contractorId?: string
}) {
  const { t } = useTranslation() // Localization hook

  const { data: contractor } = useGetContractorBySpectrumIDQuery(
    props.contractorId!,
    { skip: !props.org || !props.contractorId },
  )
  const { data: profile } = useGetUserProfileQuery()

  const [template, setTemplate] = useState("")

  useEffect(() => {
    setTemplate(
      (props.org
        ? contractor?.market_order_template
        : profile?.market_order_template) || "",
    )
  }, [contractor, props.org, profile])

  const { save, isLoading: saving } = useSaveMarketOrderTemplate(!!props.org)

  const callback = useCallback(() => {
    save(template, props.org ? contractor!.spectrum_id : undefined)
  }, [save, template, contractor, props.org])

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
              loading={saving}
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
