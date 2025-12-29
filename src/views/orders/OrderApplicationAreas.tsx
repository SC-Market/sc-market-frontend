import { Order, OrderApplicant } from "../../datatypes/Order"
import { Section } from "../../components/paper/Section"
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import {
  useAcceptOrderApplicantMutation,
  useApplyToOrderMutation,
} from "../../store/orders"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  PublishRounded,
} from "@mui/icons-material"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function OrderApplicantsArea(props: { order: Order }) {
  const { order } = props
  const { t } = useTranslation()

  return (
    <Section xs={12} title={t("orderApplicantsArea.applicants")}>
      <List sx={{ width: "100%" }}>
        {order.applicants.map((applicant, index) => (
          <ApplicantListItem order={order} key={index} applicant={applicant} />
        ))}
      </List>
    </Section>
  )
}

export function ApplicantListItem(props: {
  order: Order
  applicant: OrderApplicant
}) {
  const { applicant } = props
  const theme = useTheme<ExtendedTheme>()

  const { order } = props
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const [acceptApplicant] = useAcceptOrderApplicantMutation()

  const issueAlert = useAlertHook()

  const acceptApp = useCallback(async () => {
    const res: {
      data?: any
      error?: any
    } = await acceptApplicant({
      order_id: order.order_id,
      contractor_id: applicant.org_applicant?.spectrum_id,
      user_id: applicant.user_applicant?.username,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("orderApplicantsArea.accepted"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("orderApplicantsArea.failed_accept")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [
    acceptApplicant,
    order.order_id,
    applicant.org_applicant?.spectrum_id,
    applicant.user_applicant?.username,
    issueAlert,
    t,
  ])

  return (
    <>
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            aria-label={t("orderApplicantsArea.expand")}
            onClick={() => setOpen((o) => !o)}
            color={"inherit"}
          >
            {open ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />}
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar
            variant={"rounded"}
            src={
              applicant.org_applicant?.avatar ||
              applicant.user_applicant?.username
            }
          />
        </ListItemAvatar>
        <ListItemText>
          {applicant.org_applicant?.spectrum_id ||
            applicant.user_applicant?.username}
        </ListItemText>
      </ListItem>
      <Collapse component={ListItem} in={open}>
        <Grid container spacing={theme.layoutSpacing.compact}>
          <Grid item xs={12}>
            <Typography sx={{ width: "100%" }}>{applicant.message}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Button color={"primary"} variant={"outlined"} onClick={acceptApp}>
              {t("orderApplicantsArea.accept")}
            </Button>
          </Grid>
        </Grid>
      </Collapse>
    </>
  )
}

export function OrderApplyArea(props: { order: Order }) {
  const { order } = props
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()

  const [
    applyToOrder, // This is the mutation trigger
    // {isLoading}, // This is the destructured mutation result
  ] = useApplyToOrderMutation()

  const [appMessage, setAppMessage] = useState("")
  const issueAlert = useAlertHook()

  const processApp = async () => {
    const res: {
      data?: any
      error?: any
    } = await applyToOrder({
      order_id: order.order_id,
      contractor_id: currentOrg?.spectrum_id,
      message: appMessage,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("orderApplicantsArea.applied"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("orderApplicantsArea.failed_apply")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }

  return (
    <Section xs={12} title={t("orderApplicantsArea.apply")}>
      <Grid item xs={12}>
        <TextField
          value={appMessage}
          onChange={(e) => setAppMessage(e.target.value)}
          maxRows={5}
          minRows={5}
          label={t("orderApplicantsArea.message")}
          multiline
          sx={{ width: "100%" }}
        />
      </Grid>

      <Grid item xs={12}>
        <Box
          display={"flex"}
          alignItems={"flex-end"}
          justifyContent={"flex-end"}
          sx={{ width: "100%" }}
        >
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={processApp}
            startIcon={<PublishRounded />}
          >
            {t("orderApplicantsArea.apply")}
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}
