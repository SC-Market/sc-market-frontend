import React from "react"
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Fade,
  Grid,
  Link as MaterialLink,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../util/time"
import { useCurrentOrder } from "../../hooks/order/CurrentOrder"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownRender } from "../../components/markdown/Markdown.lazy"
import { orderIcons } from "../../datatypes/Order"
import { useTranslation } from "react-i18next"

export function ViewPublicOrder() {
  const [order, refresh] = useCurrentOrder()
  const issueAlert = useAlertHook()
  const { t } = useTranslation()

  return (
    <Grid item xs={12} lg={8}>
      <Fade in={true}>
        <Card
          sx={{
            padding: 3,
          }}
        >
          <CardHeader
            disableTypography
            title={
              <Typography
                noWrap
                sx={{ marginRight: 1 }}
                variant={"h6"}
                color={"text.secondary"}
              >
                {order.title}
              </Typography>
            }
            subheader={
              <Box
                sx={{ padding: 1.5, paddingLeft: 0 }}
                display={"flex"}
                alignItems={"center"}
              >
                <Chip
                  color={"secondary"}
                  label={t("viewPublicOrder.new")}
                  sx={{
                    marginRight: 1,
                    textTransform: "uppercase",
                    fontSize: "0.85em",
                    fontWeight: "bold",
                  }}
                />
                <MaterialLink
                  component={Link}
                  to={`/user/${order.customer}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <UnderlineLink
                    color={"text.primary"}
                    variant={"subtitle2"}
                    sx={{
                      fontWeight: "400",
                    }}
                  >
                    {order.customer}
                  </UnderlineLink>
                </MaterialLink>
                <Typography
                  display={"inline"}
                  color={"text.primary"}
                  variant={"subtitle2"}
                >
                  &nbsp; - {getRelativeTime(new Date(order.timestamp))}
                </Typography>
              </Box>
            }
          />
          <CardContent sx={{ width: "auto", minHeight: 120, paddingTop: 0 }}>
            {
              <Typography>
                <MarkdownRender text={order.description} />
              </Typography>
            }
          </CardContent>
          <CardActions>
            <Grid
              container
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Chip
                color={"primary"}
                label={order.kind}
                sx={{ marginRight: 1, marginBottom: 1, padding: 1 }}
                variant={"outlined"}
                icon={orderIcons[order.kind]}
                onClick={
                  (event) => event.stopPropagation() // Don't highlight cell if button clicked
                }
              />
              <Button
                variant={"contained"}
                color={"primary"}
                onClick={() => {
                  issueAlert({
                    message: t("viewPublicOrder.applied"),
                    severity: "success",
                  })
                }}
              >
                {t("viewPublicOrder.apply")}
              </Button>
            </Grid>
          </CardActions>
        </Card>
      </Fade>
    </Grid>
  )
}
