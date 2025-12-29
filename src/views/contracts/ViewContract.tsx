import { Order, orderIcons } from "../../datatypes/Order"
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Link as MaterialLink,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../util/time"
import React from "react"
import { useContractAppOpen } from "../../hooks/contract/ContractApp"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { dateDiffInDays } from "../market/MarketListingView"
import { useTranslation } from "react-i18next" //  i18n

export function ViewContract(props: { listing: Order }) {
  const { listing } = props
  const [appOpen, setAppOpen] = useContractAppOpen()
  const { t } = useTranslation()

  // TODO: Add proposed compensation
  return (
    <Grid item xs={12} lg={appOpen ? 8 : 12}>
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
              {listing.title}
            </Typography>
          }
          subheader={
            <Box
              sx={{ padding: 1.5, paddingLeft: 0 }}
              display={"flex"}
              alignItems={"center"}
            >
              {dateDiffInDays(new Date(), new Date(listing.timestamp)) <= 1 && (
                <Chip
                  color={"secondary"}
                  label={t("contracts.new")}
                  sx={{
                    marginRight: 1,
                    textTransform: "uppercase",
                    fontSize: "0.85em",
                    fontWeight: "bold",
                  }}
                />
              )}
              <MaterialLink
                component={Link}
                to={`/user/${listing.customer}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <UnderlineLink
                  color={"text.primary"}
                  variant={"subtitle2"}
                  sx={{
                    fontWeight: "400",
                  }}
                >
                  {listing.customer}
                </UnderlineLink>
              </MaterialLink>
              <Typography
                display={"inline"}
                color={"text.primary"}
                variant={"subtitle2"}
              >
                &nbsp; - {getRelativeTime(new Date(listing.timestamp))}
              </Typography>
            </Box>
          }
        />
        <CardContent sx={{ width: "auto", minHeight: 120, paddingTop: 0 }}>
          {
            <Typography>
              <MarkdownRender text={listing.description} />
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
              label={t(`contracts.kind.${listing.kind}`, {
                defaultValue: listing.kind,
              })}
              sx={{ marginRight: 1, marginBottom: 1, padding: 1 }}
              variant={"outlined"}
              icon={orderIcons[listing.kind]}
              onClick={
                (event) => event.stopPropagation() // Don't highlight cell if button clicked
              }
            />
            <Button
              color={"secondary"}
              variant={"contained"}
              onClick={() => setAppOpen(true)}
            >
              {t("contracts.apply")}
            </Button>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  )
}
