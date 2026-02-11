import { PaymentType, Service } from "../../datatypes/Order"
import React, { MouseEventHandler, useEffect, useMemo, useState } from "react"
import { styled, useTheme } from "@mui/material/styles"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { Section } from "../../components/paper/Section"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { MarkdownRender } from "../../components/markdown/Markdown"
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
} from "../../store/services"
import { useTranslation } from "react-i18next"
import { PAYMENT_TYPE_MAP } from "../../util/constants"

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
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
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

export interface ServiceRowProps {
  row: Service
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}

export const mobileHeadCells: readonly HeadCell<Service>[] = [
  {
    id: "title",
    numeric: false,
    disablePadding: false,
    label: "myServices.title",
  },
  {
    id: "service_id",
    numeric: false,
    disablePadding: false,
    label: "",
    noSort: true,
  },
]

export const BorderlessCell = styled(TableCell)({
  borderBottom: "none",
})

export function ServiceDetailsRow(props: { open: boolean; service: Service }) {
  const theme = useTheme<ExtendedTheme>()
  const { open, service } = props
  const { t, i18n } = useTranslation()

  return (
    <TableRow
      sx={{
        textDecoration: "none",
        color: "inherit",
        borderTop: "none",
        "& > *": {
          borderTop: "none",
        },
      }}
    >
      <TableCell colSpan={6} sx={{ padding: 0 }}>
        <Collapse in={open}>
          <Box
            sx={{
              width: "100%",
              padding: 2,
              paddingTop: 0,
            }}
          >
            <CardActionArea
              component={Link}
              to={`/order/service/${service.service_id}/edit`}
            >
              <Card
                variant={"outlined"}
                sx={{
                  width: "100%",
                  borderColor: theme.palette.outline.main,
                  borderRadius: 4,
                  paddingBottom: 2,
                }}
              >
                <CardHeader
                  title={
                    <Typography
                      sx={{ marginRight: 1 }}
                      variant={"subtitle1"}
                      color={"text.secondary"}
                    >
                      {/* Added translation keys for no_title and no_type */}
                      {service.title || <i>{t("myServices.no_title")}</i>} (
                      {service.kind || <i>{t("myServices.no_type")}</i>})
                    </Typography>
                  }
                />
                <CardContent sx={{ padding: 2 }}>
                  <Typography
                    sx={{
                      marginRight: 1,
                      maxWidth: "100%",
                      lineClamp: "10",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      "-webkit-box-orient": "vertical",
                      display: "-webkit-box",
                      "-webkit-line-clamp": "10",
                    }}
                    variant={"body2"}
                  >
                    {/* Added translation key for no_description */}
                    <MarkdownRender
                      text={
                        service.description ||
                        `_${t("myServices.no_description")}_`
                      }
                    />
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  )
}

// Helper function to get payment type translation key
const getPaymentTypeTranslationKey = (paymentType: PaymentType): string => {
  return PAYMENT_TYPE_MAP.get(paymentType) || ""
}

export function MobileServiceRow(props: ServiceRowProps) {
  const { row, index, isItemSelected } = props
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const key = getPaymentTypeTranslationKey(row.payment_type)
  const paymentType = key ? t(key) : ""

  useEffect(() => {
    setOpen(false)
  }, [row])

  return (
    <>
      <TableRow
        hover
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={index}
        selected={isItemSelected}
        sx={{
          textDecoration: "none",
          color: "inherit",
          borderBottom: "none",
          border: "none",
        }}
      >
        <BorderlessCell align={"left"}>
          <Box
            sx={{
              alignItems: "center",
              display: "inline-flex",
            }}
          >
            <span
              style={{
                maxWidth: 200,
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {row.service_name}
            </span>
          </Box>
          <Typography variant={"subtitle2"} color={"primary"}>
            {row.cost.toLocaleString(i18n.language)} aUEC {paymentType}
          </Typography>
        </BorderlessCell>

        <BorderlessCell
          padding="checkbox"
          onClick={(event) => {
            event.stopPropagation()
          }}
          align={"right"}
        >
          <IconButton
            onClick={(event) => {
              setOpen((o) => !o)
              event.stopPropagation()
            }}
          >
            {open ? (
              <KeyboardArrowDownRounded />
            ) : (
              <KeyboardArrowRightRounded />
            )}
          </IconButton>
        </BorderlessCell>
      </TableRow>
      <ServiceDetailsRow open={open} service={row} />
    </>
  )
}

export function MyServices(props: { status: string }) {
  const { status } = props
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const { t } = useTranslation()

  const { data: listings } = useGetServicesQuery(profile?.username!, {
    skip: !profile || !!currentOrg,
  })

  const { data: orglistings } = useGetServicesContractorQuery(
    currentOrg?.spectrum_id!,
    { skip: !currentOrg },
  )

  const filteredServices = useMemo(
    () =>
      ((currentOrg ? orglistings : listings) || []).filter((service) => {
        return !status || status === service.status
      }),
    [currentOrg, listings, orglistings, status],
  )

  return (
    <Section
      xs={12}
      md={12}
      lg={12}
      xl={12}
      disablePadding
      // subtitle={<FormGroup>
      //     <FormControlLabel control={<Switch onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      //         setStatus(event.target.checked ? 'active' : 'inactive');
      //     }} checked={status === 'active'}/>} label="Active Services"/>
      // </FormGroup>}
      title={`${status === "active" ? t("myServices.active") : t("myServices.inactive")} ${t("myServices.services")}`}
    >
      <PaginatedTable
        rows={filteredServices}
        initialSort={"service_name"}
        generateRow={MobileServiceRow}
        keyAttr={"service_id"}
        headCells={mobileHeadCells.map((cell) => ({
          ...cell,
          label: cell.label ? t(cell.label) : "",
        }))}
        disableSelect
      />
    </Section>
  )
}
