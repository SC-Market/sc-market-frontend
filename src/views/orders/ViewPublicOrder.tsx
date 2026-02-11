import React from "react"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../util/time"
import { useCurrentOrder } from "../../hooks/order/CurrentOrder"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { orderIcons } from "../../datatypes/Order"
import { useTranslation } from "react-i18next"

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
