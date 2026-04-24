import { Order, OrderApplicant } from "../../features/orders/domain/types"
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
import React, { useState } from "react"
import {
  useAcceptApplicant,
  useApplyToOrder,
} from "../../features/orders/hooks/useOrderApplications"
import {
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  PublishRounded,
} from "@mui/icons-material"
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

  const acceptApp = useAcceptApplicant(order.order_id, {
    orgSpectrumId: applicant.org_applicant?.spectrum_id,
    userUsername: applicant.user_applicant?.username,
  })

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

  const { appMessage, setAppMessage, processApp } = useApplyToOrder(order.order_id)

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
