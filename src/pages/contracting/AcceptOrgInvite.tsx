import { useNavigate, useParams } from "react-router-dom"
import React, { useEffect } from "react"
import { Section } from "../../components/paper/Section"
import LoadingButton from "@mui/lab/LoadingButton"
import { Grid } from "@mui/material"
import { OrgDetails } from "../../components/list/UserDetails"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageAcceptOrgInvite } from "../../features/contracting/hooks/usePageAcceptOrgInvite"

export function AcceptOrgInvite() {
  const { t } = useTranslation()
  const { invite_id } = useParams<{ invite_id: string }>()
  const navigate = useNavigate()

  const pageData = usePageAcceptOrgInvite(invite_id || "")

  useEffect(() => {
    if (pageData.error) {
      navigate("/404")
    }
  }, [pageData.error, navigate])

  return (
    <StandardPageLayout
      title={t("org.invite.acceptInviteTitle")}
      sidebarOpen={true}
      maxWidth="md"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <Section title={t("org.invite.acceptContractorInvite")}>
        <Grid item xs={12}>
          {t("org.invite.invitedMessage")}{" "}
          {pageData.contractor && <OrgDetails org={pageData.contractor} />}
        </Grid>

        <Grid item>
          <LoadingButton
            onClick={pageData.acceptInvite}
            loading={pageData.isAccepting}
            variant={"contained"}
          >
            {t("org.invite.accept")}
          </LoadingButton>
        </Grid>
      </Section>
    </StandardPageLayout>
  )
}
