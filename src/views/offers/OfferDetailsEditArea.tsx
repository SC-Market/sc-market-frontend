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
import moment from "moment/moment"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { orderIcons } from "../../datatypes/Order"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"

export function OfferDetailsEditArea(props: { session: OfferSession }) {
  const { session } = props
  const [body, setBody] = useCounterOffer()

  return (
    <Grid item xs={12} lg={12} md={12}>
      <TableContainer component={Paper}>
        <Table aria-label="details table" sx={{ overflowY: "hidden" }}>
          <TableBody>
            <TableRow
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                Customer
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
                Seller
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
                Date
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent={"right"}>
                  {moment(session.offers[0].timestamp).format(
                    "MMMM Do YYYY, h:mm:ss a",
                  )}
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                Title
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
                Kind
              </TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  select
                  label="Kind*"
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
                <Stack direction="column" spacing={1}>
                  Details
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
                Offer
              </TableCell>
              <TableCell align="right">
                <Stack direction={"row"} justifyContent={"right"}>
                  <Stack
                    direction="column"
                    justifyContent={"right"}
                    spacing={1}
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
                      label={"Offer Amount"}
                      value={body.cost}
                      color={"secondary"}
                    />
                    <TextField
                      select
                      size="small"
                      label={"Payment Type"}
                      value={body.payment_type}
                      onChange={(event: any) => {
                        setBody({ ...body, payment_type: event.target.value })
                      }}
                      SelectProps={{
                        IconComponent: KeyboardArrowDownRoundedIcon,
                      }}
                    >
                      <MenuItem value={"one-time"}>One time</MenuItem>
                      <MenuItem value={"hourly"}>Hourly</MenuItem>
                      <MenuItem value={"daily"}>Daily</MenuItem>
                      <MenuItem value={"unit"}>Unit</MenuItem>
                      <MenuItem value={"box"}>Box</MenuItem>
                      <MenuItem value={"scu"}>SCU</MenuItem>
                      <MenuItem value={"cscu"}>cSCU</MenuItem>
                      <MenuItem value={"mscu"}>mSCU</MenuItem>
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
