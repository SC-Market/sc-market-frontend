import { Order, orderIcons } from "../../datatypes/Order"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../util/time"
import React from "react"
import { useContractAppOpen } from "../../hooks/contract/ContractApp"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { dateDiffInDays } from "../market/MarketListingView"
import { useTranslation } from "react-i18next" //  i18n

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fab from '@mui/material/Fab';
import DialogContentText from '@mui/material/DialogContentText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ElectricBoltRounded from '@mui/icons-material/ElectricBoltRounded';
import ArchiveRounded from '@mui/icons-material/ArchiveRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import AddShoppingCartRounded from '@mui/icons-material/AddShoppingCartRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';

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
