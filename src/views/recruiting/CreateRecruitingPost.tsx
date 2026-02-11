import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Section } from "../../components/paper/Section"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  RecruitingPost,
  useRecruitingCreatePostMutation,
  useRecruitingUpdatePostMutation,
} from "../../store/recruiting"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import throttle from "lodash/throttle"
import { RecruitingPostView } from "./RecruitingPostView"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Popover from '@mui/material/Popover';
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
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';

export interface RecruitingPostState {
  title: string
  body: string
}

export function CreateRecruitingPost(props: { post?: RecruitingPost }) {
  const { post } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [state, setState] = React.useState<RecruitingPostState>({
    title: "",
    body: "",
  })

  useEffect(() => {
    if (post) {
      setState({
        title: post.title,
        body: post.body,
      })
    }
  }, [post])

  const issueAlert = useAlertHook()
  const [contractor] = useCurrentOrg()

  const [
    createPost, // This is the mutation trigger
  ] = useRecruitingCreatePostMutation()
  const [
    updatePost, // This is the mutation trigger
  ] = useRecruitingUpdatePostMutation()

  const navigate = useNavigate()

  const submitPost = useCallback(
    async (event: any) => {
      let request
      if (!post) {
        request = createPost({
          ...state,
          contractor: contractor!.spectrum_id,
        })
      } else {
        request = updatePost({
          body: state,
          post_id: post.post_id,
        })
      }

      request
        .unwrap()
        .then((res) => {
          issueAlert({
            message: t("recruiting_post.alert.submitted"),
            severity: "success",
          })

          navigate(`/recruiting/post/${res.post_id}`)
        })
        .catch(issueAlert)

      return false
    },
    [contractor, createPost, post, issueAlert, state, updatePost, t],
  )

  const [stateBuffer, setStateBuffer] = useState(state)

  const updateStateBuffer = React.useMemo(
    () =>
      throttle(async (s) => {
        setStateBuffer(s)
      }, 2000),
    [setStateBuffer],
  )

  useEffect(() => {
    updateStateBuffer(state)
  }, [state, updateStateBuffer])

  const fullPost: RecruitingPost = useMemo(
    () => ({
      ...stateBuffer,
      post_id: "",
      contractor: contractor!,
      timestamp: Date.now(),
      comments: [],
      upvotes: 25,
      downvotes: 4,
    }),
    [stateBuffer, contractor],
  )

  return (
    <>
      {/*TODO: Make it only update render every second or so*/}
      <RecruitingPostView post={fullPost} />
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("recruiting_post.about")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12} lg={12}>
            <TextField
              label={t("recruiting_post.title_required")}
              fullWidth
              id="order-title"
              value={state.title}
              onChange={(event: React.ChangeEvent<{ value: string }>) =>
                setState({ ...state, title: event.target.value })
              }
              color={"secondary"}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant={"body2"}>
              {t("recruiting_post.markdown_info") + " "}
              <Link
                rel="noopener noreferrer"
                target="_blank"
                href={
                  "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
                }
              >
                <UnderlineLink color={"text.secondary"}>
                  {t("recruiting_post.markdown_link")}
                </UnderlineLink>
              </Link>{" "}
              {t("recruiting_post.markdown_info_end")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <MarkdownEditor
              TextFieldProps={{
                label: t("recruiting_post.description_required"),
              }}
              value={state.body}
              onChange={(value: string) => {
                setState({ ...state, body: value })
              }}
              noPreview
            />
          </Grid>
        </Grid>
      </Section>

      <Grid item xs={12} container justifyContent={"right"}>
        <Button
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          onClick={submitPost}
        >
          {t("recruiting_post.submit")}
        </Button>
      </Grid>
    </>
  )
}
