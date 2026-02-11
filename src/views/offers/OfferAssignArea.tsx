import { Section } from "../../components/paper/Section"
import React, { useCallback, useEffect, useState } from "react"
import { MinimalUser } from "../../datatypes/User"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetContractorMembersQuery } from "../../store/contractor"
import throttle from "lodash/throttle"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { contractorsApi } from "../../store/contractor"
import { store } from "../../store/store"
import {
  useAssignOfferMutation,
  useUnassignOfferMutation,
  OfferSession,
} from "../../store/offer"
import { useAlertHook } from "../../hooks/alert/AlertHook"
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

export function OfferAssignArea(props: { offer: OfferSession }) {
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{
    username: string
    display_name: string
  } | null>(null)
  const [currentOrg] = useCurrentOrg()
  const { offer } = props
  const [options, setOptions] = useState<MinimalUser[]>([])

  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: currentOrg?.spectrum_id || "",
    page: 0,
    page_size: 100,
    search: "",
    role_filter: "",
    sort: "username",
  })

  const members = membersData?.members || []

  const fetchOptions = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        return
      }

      const { status, data, error } = await store.dispatch(
        contractorsApi.endpoints.searchContractorMembers.initiate({
          spectrum_id: currentOrg?.spectrum_id!,
          query: query,
        }),
      )

      setOptions(data || [])
    },
    [currentOrg?.spectrum_id],
  )

  const retrieve = React.useMemo(
    () =>
      throttle((query: string) => {
        fetchOptions(query)
      }, 400),
    [fetchOptions],
  )

  useEffect(() => {
    retrieve(target)
  }, [target, retrieve])

  const [assignUser] = useAssignOfferMutation()
  const [unassignUser] = useUnassignOfferMutation()

  const updateAssignment = useCallback(async () => {
    if (!targetObject) {
      return
    }

    const res: { data?: any; error?: any } = await assignUser({
      session_id: offer.id,
      user_id: targetObject.username!,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("memberAssignArea.assigned"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("memberAssignArea.failed_assign")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [assignUser, offer.id, issueAlert, targetObject, t])

  const removeAssignment = useCallback(async () => {
    const res: { data?: any; error?: any } = await unassignUser({
      session_id: offer.id,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("memberAssignArea.unassigned"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("memberAssignArea.failed_unassign")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [unassignUser, offer.id, issueAlert, t])

  return (
    <Section
      xs={12}
      title={
        offer.assigned_to
          ? t("memberAssignArea.reassign")
          : t("memberAssignArea.assign")
      }
    >
      <Grid item xs={12}>
        <Autocomplete
          filterOptions={(x) => x}
          fullWidth
          options={
            target
              ? options
              : members
                  .map((u) => ({
                    username: u.username,
                    display_name: u.username,
                  }))
                  .slice(0, 8)
          }
          getOptionLabel={(option) =>
            `${option.username} (${option.display_name})`
          }
          disablePortal
          color={targetObject ? "success" : "primary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("memberAssignArea.handle")}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            />
          )}
          value={targetObject}
          onChange={(
            event: any,
            newValue: { display_name: string; username: string } | null,
          ) => {
            setTargetObject(newValue)
          }}
          inputValue={target}
          onInputChange={(event, newInputValue) => {
            setTarget(newInputValue)
          }}
        />
      </Grid>
      <Grid item>
        <Box
          display={"flex"}
          alignItems={"flex-end"}
          justifyContent={"flex-end"}
          sx={{ width: "100%" }}
        >
          <Button
            variant={"contained"}
            color={"error"}
            onClick={removeAssignment}
            startIcon={<PersonRemoveRounded />}
          >
            {t("memberAssignArea.unassign")}
          </Button>
        </Box>
      </Grid>
      <Grid item>
        <Box
          display={"flex"}
          alignItems={"flex-end"}
          justifyContent={"flex-end"}
          sx={{ width: "100%" }}
        >
          <Button
            variant={"contained"}
            color={"secondary"}
            onClick={updateAssignment}
            startIcon={<PersonRounded />}
          >
            {t("memberAssignArea.assign")}
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}
