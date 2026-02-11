import React, { useMemo } from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { UnderlineLink } from "../../components/typography/UnderlineLink"

import { Link } from "react-router-dom"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { RecruitingPost } from "../../store/recruiting"
import { contractorKindIcons } from "../contractor/ContractorList"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { RecruitmentVotes } from "../../components/button/RecruitmentVotes"
import { useTranslation } from "react-i18next"
import { LongPressMenu } from "../../components/gestures"
import { useNavigate } from "react-router-dom"

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
import BusinessRounded from '@mui/icons-material/BusinessRounded';

export const RecruitingPostItem = React.memo(
  function RecruitingPostItem(props: { post: RecruitingPost; index: number }) {
    const { post, index } = props
    const { contractor } = post
    const theme = useTheme<ExtendedTheme>()
    const { t } = useTranslation()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
    const navigate = useNavigate()

    // Long-press menu actions
    const longPressActions = useMemo(() => {
      const recruitingUrl = `/contractor/${contractor.spectrum_id}/recruiting`
      const contractorUrl = `/contractor/${contractor.spectrum_id}`

      return [
        {
          label: t("recruiting.viewDetails", { defaultValue: "View Details" }),
          icon: <VisibilityRounded />,
          onClick: () => navigate(recruitingUrl),
        },
        {
          label: t("recruiting.viewContractor", {
            defaultValue: "View Contractor",
          }),
          icon: <BusinessRounded />,
          onClick: () => navigate(contractorUrl),
        },
        {
          label: t("recruiting.share", { defaultValue: "Share" }),
          icon: <ShareRounded />,
          onClick: () => {
            const url = `${window.location.origin}${recruitingUrl}`
            if (navigator.share) {
              navigator
                .share({
                  title: post.title,
                  text: post.title,
                  url,
                })
                .catch(() => {
                  // User cancelled or error occurred
                })
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard.writeText(url)
            }
          },
        },
      ]
    }, [post, contractor, navigate, t])

    const cardInnerContent = (
      <Link
        to={`/contractor/${contractor.spectrum_id}/recruiting`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Fade
          in={true}
          style={{
            transitionDelay: `${50 + 50 * index}ms`,
            transitionDuration: "500ms",
          }}
        >
          <Box
            sx={{
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: theme.spacing(2),
                right: theme.spacing(2),
                zIndex: 2,
              }}
            >
              <RecruitmentVotes post={post} />
            </Box>
            <CardActionArea
              sx={{
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <Card
                sx={{
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  padding: 1,
                  border: `1px solid ${theme.palette.outline.main}`,
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      src={contractor.avatar}
                      aria-label={t("recruiting_post.contractor", {
                        defaultValue: "Contractor",
                      })}
                      variant={"rounded"}
                      sx={{
                        maxHeight: theme.spacing(12),
                        maxWidth: theme.spacing(12),
                        // maxWidth:'100%',
                        // maxHeight:'100%',
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  }
                  title={
                    <MaterialLink
                      component={Link}
                      to={`/contractor/${contractor.spectrum_id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <UnderlineLink
                        color={"text.secondary"}
                        variant={"subtitle1"}
                        fontWeight={"bold"}
                      >
                        {contractor.name}
                      </UnderlineLink>
                    </MaterialLink>
                  }
                  subheader={
                    <Box>
                      <Grid
                        container
                        alignItems={"center"}
                        spacing={theme.layoutSpacing.compact}
                      >
                        <Grid item>
                          <PeopleAltRoundedIcon
                            style={{ color: theme.palette.text.primary }}
                          />
                        </Grid>
                        <Grid item>
                          <Typography
                            sx={{ marginLeft: 1 }}
                            color={"text.primary"}
                            fontWeight={"bold"}
                          >
                            {contractor.size}
                          </Typography>
                        </Grid>
                      </Grid>

                      <ListingSellerRating contractor={contractor} />
                    </Box>
                  }
                />
                <CardContent>
                  <Typography
                    variant={"h4"}
                    sx={{ width: "100%" }}
                    textAlign={"center"}
                  >
                    <b>{post.title}</b>
                  </Typography>
                  <Typography
                    sx={{
                      "-webkit-box-orient": "vertical",
                      display: "-webkit-box",
                      "-webkit-line-clamp": "10",
                      overflow: "hidden",
                      lineClamp: "10",
                      textOverflow: "ellipsis",
                      // whiteSpace: "pre-line"
                    }}
                    variant={"body2"}
                    component="div"
                  >
                    <MarkdownRender text={post.body} plainText />
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box>
                    {contractor.fields.map((field) => (
                      <Chip
                        key={field}
                        color={"primary"}
                        label={t(`contractor.fields.${field}`, field)}
                        sx={{
                          marginRight: 1,
                          marginBottom: 1,
                          padding: 1,
                          textTransform: "capitalize",
                        }}
                        variant={"outlined"}
                        icon={contractorKindIcons[field]}
                        onClick={
                          (event) => {
                            event.stopPropagation()
                            event.preventDefault()
                          } // Don't highlight cell if button clicked
                        }
                      />
                    ))}
                  </Box>
                </CardActions>
              </Card>
            </CardActionArea>
          </Box>
        </Fade>
      </Link>
    )

    // Wrap inner content with LongPressMenu on mobile, then wrap in Grid item
    const wrappedContent =
      isMobile && longPressActions.length > 0 ? (
        <LongPressMenu actions={longPressActions} enabled={isMobile}>
          {cardInnerContent}
        </LongPressMenu>
      ) : (
        cardInnerContent
      )

    return (
      <Grid item xs={12} lg={12}>
        {wrappedContent}
      </Grid>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if post data actually changed
    return (
      prevProps.post.post_id === nextProps.post.post_id &&
      prevProps.index === nextProps.index
    )
  },
)

// RecruitingPostSkeleton is now exported from components/skeletons
