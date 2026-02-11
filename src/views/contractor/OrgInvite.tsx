import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import throttle from "lodash/throttle"
import { useSearchUsersQuery } from "../../store/profile"
import { MinimalUser } from "../../datatypes/User"
import { useInviteContractorMembersMutation } from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
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
import { MenuProps } from '@mui/material/Menu';
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

export function OrgInvite() {
  const [currentOrg] = useCurrentOrg()
  const [query, setQuery] = useState("")
  const [buffer, setBuffer] = useState("")
  const [message, setMessage] = useState("")
  const { t } = useTranslation()

  const { data: users } = useSearchUsersQuery(query, { skip: !query })

  const retrieve = React.useMemo(
    () =>
      throttle((query: string) => {
        if (query.length > 2) {
          setQuery(query)
        }
      }, 400),
    [setQuery],
  )

  const [choices, setChoices] = useState<MinimalUser[]>([])

  const [
    sendInvites, // This is the mutation trigger
  ] = useInviteContractorMembersMutation()

  const issueAlert = useAlertHook()

  const submitInviteForm = useCallback(
    async (event: any) => {
      // event.preventDefault();
      sendInvites({
        contractor: currentOrg?.spectrum_id!,
        users: choices.map((u) => u.username),
        message: message,
      })
        .unwrap()
        .then(() => {
          setChoices([])
          setBuffer("")

          issueAlert({
            message: t("orgInvite.submitted"),
            severity: "success",
          })
        })
        .catch((err) => issueAlert(err))

      return false
    },
    [choices, currentOrg?.spectrum_id, message, sendInvites, issueAlert, t],
  )

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("orgInvite.invite_members")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          fullWidth
          multiple
          filterSelectedOptions
          options={users || []}
          getOptionLabel={(u) => u.username}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField
              {...params}
              variant="outlined"
              label={t("orgInvite.username")}
              fullWidth
              color={"secondary"}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            />
          )}
          renderTags={(
            value: readonly MinimalUser[] | undefined,
            getTagProps,
          ) =>
            (value || []).map((option, index) => (
              <Chip
                color={"secondary"}
                label={option.username}
                sx={{ marginRight: 1 }}
                variant={"outlined"}
                avatar={<Avatar alt={option.username} src={option.avatar} />}
                {...getTagProps({ index })}
                key={option.username}
              />
            ))
          }
          value={choices}
          onChange={(event: any, newValue) => {
            setChoices(newValue || [])
          }}
          inputValue={buffer}
          onInputChange={(event, newInputValue) => {
            setBuffer(newInputValue)
            retrieve(newInputValue)
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          id="order-type"
          multiline
          maxRows={5}
          minRows={5}
          color={"secondary"}
          label={t("orgInvite.note")}
          value={message}
          onChange={(event: any) => {
            setMessage(event.target.value)
          }}
        ></TextField>
      </Grid>

      <Grid item container justifyContent={"center"}>
        <Button
          variant={"outlined"}
          color={"primary"}
          onClick={submitInviteForm}
          disabled={!choices.length}
        >
          {t("orgInvite.submit")}
        </Button>
      </Grid>
    </Section>
  )
}
