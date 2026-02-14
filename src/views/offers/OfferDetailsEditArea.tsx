import { OfferSession } from "../../store/offer"
import {
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import React from "react"
import { OrgDetails, UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import { format } from "../../util/time"
import { MarkdownEditor } from "../../components/markdown/Markdown.lazy"
import { orderIcons } from "../../datatypes/Order"
import { PAYMENT_TYPES } from "../../util/constants"
import { useTranslation } from "react-i18next"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function OfferDetailsEditArea(props: { session: OfferSession }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { session } = props
  const [body, setBody] = useCounterOffer()

  return (
    <Grid item xs={12} lg={12} md={12}>
      <TableContainer component={Paper}>
        <Table
          aria-label={t("offers.details_table")}
          sx={{ overflowY: "hidden" }}
        >
          <TableBody>
            <TableRow
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsEditArea.customer")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  <UserDetails user={session.customer} />
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsEditArea.seller")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  {session.assigned_to ? (
                    <UserDetails user={session.assigned_to} />
                  ) : (
                    <OrgDetails org={session.contractor!} />
                  )}
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsEditArea.date")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  {format(new Date(session.offers[0].timestamp), "MMMM do yyyy, h:mm:ss a")}
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsEditArea.title")}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  <TextField
                    value={body.title}
                    onChange={(event) =>
                      setBody({ ...body, title: event.target.value })
                    }
                    fullWidth
                    size="small"
                  />
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsEditArea.kind")}
              </TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  select
                  label={t("OfferDetailsEditArea.kind") + "*"}
                  id="order-type"
                  value={body.kind}
                  onChange={(event) => {
                    setBody({ ...body, kind: event.target.value })
                  }}
                  color={"secondary"}
                  SelectProps={{
                    IconComponent: KeyboardArrowDownRoundedIcon,
                  }}
                >
                  {Object.keys(orderIcons).map((k) => (
                    <MenuItem value={k} key={k}>
                      {k}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {/*<TableCell component="th" scope="row">*/}
              {/*  Description*/}
              {/*</TableCell>*/}
              <TableCell colSpan={2}>
                <Stack direction="column" spacing={theme.layoutSpacing.compact}>
                  {t("OfferDetailsEditArea.details")}
                  <Typography color={"text.secondary"} variant={"subtitle2"}>
                    <MarkdownEditor
                      value={body.description}
                      onChange={(value) =>
                        setBody({ ...body, description: value })
                      }
                    />
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>

            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {t("OfferDetailsEditArea.offer")}
              </TableCell>
              <TableCell align="right">
                <Stack direction={"row"} justifyContent={"right"}>
                  <Stack
                    direction="column"
                    justifyContent={"right"}
                    spacing={theme.layoutSpacing.compact}
                    maxWidth={300}
                  >
                    <NumericFormat
                      decimalScale={0}
                      allowNegative={false}
                      customInput={TextField}
                      thousandSeparator
                      onValueChange={async (values, sourceInfo) => {
                        setBody({ ...body, cost: values.value || "0" })
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">
                            {"aUEC"}
                          </InputAdornment>
                        ),
                        inputMode: "numeric",
                      }}
                      size="small"
                      label={t("OfferDetailsEditArea.offerAmount")}
                      value={body.cost}
                      color={"secondary"}
                    />
                    <TextField
                      select
                      size="small"
                      label={t("OfferDetailsEditArea.paymentType")}
                      value={body.payment_type}
                      onChange={(event: any) => {
                        setBody({ ...body, payment_type: event.target.value })
                      }}
                      SelectProps={{
                        IconComponent: KeyboardArrowDownRoundedIcon,
                      }}
                    >
                      {PAYMENT_TYPES.map((paymentType) => (
                        <MenuItem
                          key={paymentType.value}
                          value={paymentType.value}
                        >
                          {t(paymentType.translationKey)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Stack>
              </TableCell>
            </TableRow>

            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            ></TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
