import { OfferSession } from "../../store/offer"
import React from "react"
import { OrgDetails, UserDetails } from "../../components/list/UserDetails"
import { Stack } from "@mui/system"
import moment from "moment/moment"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { orderIcons } from "../../datatypes/Order"
import { PAYMENT_TYPES } from "../../util/constants"
import { useTranslation } from "react-i18next"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import { GridProps } from '@mui/material/Grid';
import List from '@mui/material/List';
import TablePagination from '@mui/material/TablePagination';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ButtonGroup from '@mui/material/ButtonGroup';
import Rating from '@mui/material/Rating';
import CardActionArea from '@mui/material/CardActionArea';
import FormGroup from '@mui/material/FormGroup';
import { Theme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Announcement from '@mui/icons-material/Announcement';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HourglassTop from '@mui/icons-material/HourglassTop';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';
import PersonRemoveRounded from '@mui/icons-material/PersonRemoveRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import PublishRounded from '@mui/icons-material/PublishRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';
import DoneRounded from '@mui/icons-material/DoneRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';

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
