import { Section } from "../../components/paper/Section"
import React, { useState, useCallback } from "react"
import { NotificationEntry } from "../../features/notifications/components/NotificationEntry"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetNotificationsQuery } from "../../store/notification"
import { useTranslation } from "react-i18next"
import { EmptyNotifications } from "../../components/empty-states"
import { PullToRefresh } from "../../components/gestures"
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

export function DashNotificationArea() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const { data: notificationsData, refetch } = useGetNotificationsQuery({
    page: page, // API uses 0-based indexing
    pageSize: pageSize,
  })
  const { t } = useTranslation()

  const notifications = notificationsData?.notifications || []
  const total = notificationsData?.pagination?.total || 0

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  return (
    <Section
      title={t("DashNotificationArea.notifications")}
      disablePadding
      xs={12}
    >
      {/*<Box sx={{width: '100%', padding: 2}}>*/}
      <Grid item xs={12}>
        <PullToRefresh
          onRefresh={async () => {
            await refetch()
          }}
          enabled={isMobile}
        >
          {notifications.length === 0 ? (
            <Grid item xs={12}>
              <EmptyNotifications sx={{ py: 4 }} />
            </Grid>
          ) : (
            <List
              sx={{
                "&>:first-child": {
                  borderTop: `1px solid ${theme.palette.outline.main}`,
                },
                "&>:last-child": {
                  borderBottom: "none",
                },
                "& > *": {
                  borderBottom: `1px solid ${theme.palette.outline.main}`,
                },
                padding: 0,
                maxHeight: 400,
                overflowY: "scroll",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              {(notifications || []).map(
                (notification, idx) => (
                  // <Fade in={true} style={{transitionDelay: `${50 + 50 * idx}ms`, transitionDuration: '500ms'}} key={idx}>
                  (<NotificationEntry notif={notification} key={idx} />)
                ),
                // </Fade>
              )}
            </List>
          )}
        </PullToRefresh>
      </Grid>
      <Grid item xs={12}>
        <TablePagination
          labelRowsPerPage={t("rows_per_page")}
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", { from, to, count })
          }
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
      {/*</Box>*/}
    </Section>
  );
}
