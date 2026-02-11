import {
  RecruitingPost,
  useRecruitingUpvotePostMutation,
} from "../../store/recruiting"
import React, { useState } from "react"
import { useGetUserProfileQuery } from "../../store/profile"
import { BACKEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';

export function RecruitmentVotes(props: { post: RecruitingPost }) {
  const { post } = props
  const { t } = useTranslation()

  const [
    doUpvote, // This is the mutation trigger
  ] = useRecruitingUpvotePostMutation()

  const { data: profile } = useGetUserProfileQuery()
  const [pressed, setPressed] = useState(0)

  return (
    <Button
      color={"success"}
      startIcon={<KeyboardArrowUpRounded />}
      onClick={async (event) => {
        event.stopPropagation()
        event.preventDefault()
        if (profile) {
          //const resp = await doUpvote(post.post_id) as {data: {already_voted: boolean}}
          doUpvote(post.post_id)
          // if (resp.data && !resp.data.already_voted) {
          //     setPressed(1)
          // }
        } else {
          // Redirect to frontend login page with current path as redirect parameter
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
        return false
      }}
      variant={"contained"}
      size={"small"}
      title={t("recruitmentVotes.upvoteButtonTooltip", "Upvote this post")}
      aria-label={t(
        "accessibility.upvoteRecruitmentPost",
        "Upvote this recruitment post",
      )}
      aria-describedby={`recruitment-upvote-count-${post.post_id}`}
    >
      <span id={`recruitment-upvote-count-${post.post_id}`} className="sr-only">
        {t("accessibility.recruitmentUpvoteCount", "Upvotes: {{count}}", {
          count: post.upvotes + pressed,
        })}
      </span>
      {post.upvotes + pressed}
    </Button>
  )
}
