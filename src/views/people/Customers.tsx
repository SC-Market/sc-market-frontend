import React, { MouseEventHandler, ReactElement } from "react"
import { Section } from "../../components/paper/Section"
import { User } from "../../datatypes/User"
import { Link } from "react-router-dom"
import { styled } from "@mui/material/styles"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetContractorCustomersQuery } from "../../store/contractor"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { useTranslation } from "react-i18next"
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

function PeopleRow(props: {
  row: User
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}): ReactElement {
  const { row, onClick, isItemSelected, labelId } = props
  const theme = useTheme<ExtendedTheme>()
  return (
    <TableRow
      hover
      onClick={onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.username}
      selected={isItemSelected}
    >
      {/*<TableCell padding="checkbox">*/}
      {/*    <Checkbox*/}
      {/*        color="primary"*/}
      {/*        checked={isItemSelected}*/}
      {/*        inputProps={{*/}
      {/*            'aria-labelledby': labelId,*/}
      {/*        }}*/}
      {/*    />*/}
      {/*</TableCell>*/}
      <TableCell
        component="th"
        id={labelId}
        scope="row"
        // padding="none"
      >
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item>
            <Avatar src={row.avatar} />
          </Grid>
          <Grid item>
            <MaterialLink
              component={Link}
              to={`/user/${row.username}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink
                color={"text.secondary"}
                variant={"subtitle1"}
                fontWeight={"bold"}
              >
                {row.username}
              </UnderlineLink>
            </MaterialLink>
            <Typography variant={"subtitle2"}>{row.display_name}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"}>
          {/*{row.orders.toLocaleString('en-US')}*/}5
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant={"subtitle1"} color={"primary"}>
          {/*{row.spent.toLocaleString('en-US')}*/}
          32 aUEC
        </Typography>
      </TableCell>
    </TableRow>
  )
}

const SearchIconWrapper = styled("div")((args: { theme: Theme }) => ({
  padding: args.theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))

const headCells: readonly HeadCell<User>[] = [
  {
    id: "username",
    numeric: false,
    disablePadding: false,
    label: "customerList.username",
  },
  {
    id: "orders",
    numeric: true,
    disablePadding: false,
    label: "customerList.orders",
  },
  {
    id: "spent",
    numeric: true,
    disablePadding: false,
    label: "customerList.total_value",
  },
]

export function CustomerList(props: {
  contractors?: boolean
  members?: boolean
  customers?: boolean
}) {
  const [currentOrg] = useCurrentOrg()
  const { t } = useTranslation()

  const { isLoading, data } = useGetContractorCustomersQuery(
    currentOrg?.spectrum_id!,
    { skip: !currentOrg?.spectrum_id },
  )

  return (
    <Section xs={12} title={t("customerList.customers")} disablePadding>
      {isLoading ? null : (
        <PaginatedTable<User>
          rows={data!}
          initialSort={"username"}
          generateRow={PeopleRow}
          keyAttr={"username"}
          headCells={headCells.map((cell) => ({
            ...cell,
            label: t(cell.label),
          }))}
          disableSelect
        />
      )}
    </Section>
  )
}
