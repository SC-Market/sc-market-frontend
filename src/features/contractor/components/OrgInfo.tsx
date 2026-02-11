import { Contractor } from "../../../datatypes/Contractor"
import React from "react"
import { HapticTab } from "../../../components/haptic"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ContractorReviewSummary } from "../../../views/contractor/OrgReviews"
import { a11yProps } from "../../../components/tabs/Tabs"
import { OpenLayout } from "../../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { OrgBannerArea } from "./OrgBannerArea"
import { PageBreadcrumbs } from "../../../components/navigation"
import { OrgMetaTags } from "./OrgMetaTags"
import { OrgHeader } from "./OrgHeader"
import { OrgTabs } from "./OrgTabs"
import { OrgTabContent } from "./OrgTabContent"
import { useOrgTab } from "../hooks/useOrgTab"
import { useRecruitingGetPostByOrgQuery } from "../../../store/recruiting"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import AppBar from '@mui/material/AppBar';
import { PaperProps } from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ImageListItem, { imageListItemClasses } from '@mui/material/ImageListItem';
import CardActionArea from '@mui/material/CardActionArea';
import Menu from '@mui/material/Menu';
import TablePagination from '@mui/material/TablePagination';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import ShareRounded from '@mui/icons-material/ShareRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';

export function OrgInfo(props: { contractor: Contractor }) {
  const { contractor } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const page = useOrgTab()
  const { data: recruiting_post } = useRecruitingGetPostByOrgQuery(
    contractor.spectrum_id,
  )

  return (
    <OpenLayout sidebarOpen={true}>
      <OrgMetaTags contractor={contractor} />
      <Container maxWidth="xl">
        <PageBreadcrumbs
          items={[
            {
              label: t("contractors.title", "Contractors"),
              href: "/contractors",
            },
            { label: contractor.name },
          ]}
        />
      </Container>
      <Box sx={{ position: "relative" }}>
        <OrgBannerArea org={contractor} />
        <Box
          sx={{
            ...(theme.palette.mode === "dark"
              ? { position: "relative", top: -450 }
              : { position: "relative", top: -200 }),
          }}
        >
          <Container maxWidth="xl">
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={theme.layoutSpacing.component}
                  alignItems="flex-end"
                  justifyContent="space-between"
                  minHeight={375}
                >
                  <Grid item xs={12} md={8}>
                    <OrgHeader contractor={contractor} />
                  </Grid>
                  <ContractorReviewSummary contractor={contractor} />
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <OrgTabs
                  spectrumId={contractor.spectrum_id}
                  currentTab={page}
                  hasRecruitingPost={!!recruiting_post}
                />
              </Grid>
            </Grid>
          </Container>
          <OrgTabContent currentTab={page} contractor={contractor} />
        </Box>
      </Box>
    </OpenLayout>
  )
}

export function OrgInfoSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <OpenLayout sidebarOpen={true}>
      <Box sx={{ position: "relative" }}>
        <Skeleton
          variant="rectangular"
          sx={{
            height: theme.palette.mode === "dark" ? 450 : 200,
            width: "100%",
            borderRadius: 0,
          }}
        />
        <Container
          maxWidth={"xl"}
          sx={{
            ...(theme.palette.mode === "dark"
              ? { position: "relative", top: -450 }
              : { position: "relative", top: -200 }),
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            {/* Header: left = avatar + name/size/chips (md=8), right = ratings summary (md=4) */}
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing.component}
                alignItems={"flex-end"}
                justifyContent={"space-between"}
                minHeight={375}
              >
                <Grid item xs={12} md={8}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    flexWrap="wrap"
                  >
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        height: theme.spacing(12),
                        width: theme.spacing(12),
                        flexShrink: 0,
                        borderRadius: theme.spacing(theme.borderRadius.image),
                      }}
                    />
                    <Stack spacing={0.5}>
                      <Skeleton
                        variant="text"
                        width={200}
                        height={28}
                        sx={{ display: "block" }}
                      />
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ mt: 0.5 }}
                      >
                        <PeopleAltRoundedIcon
                          style={{ color: theme.palette.text.primary }}
                        />
                        <Skeleton variant="text" width={40} height={20} />
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ mt: 0.5 }}
                      >
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={28}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={28}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={28}
                          sx={{ borderRadius: 1 }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      height: 120,
                      width: "100%",
                      borderRadius: 1,
                      maxWidth: 320,
                      ml: "auto",
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
                <Tabs
                  value={0}
                  aria-label={t("ui.aria.orgInfoArea")}
                  variant="scrollable"
                >
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<StorefrontRounded />}
                    {...a11yProps(0)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<DesignServicesRounded />}
                    {...a11yProps(1)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<InfoRounded />}
                    {...a11yProps(2)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<CreateRounded />}
                    {...a11yProps(3)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<PeopleAltRoundedIcon />}
                    {...a11yProps(4)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<PersonAddRounded />}
                    {...a11yProps(5)}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<StarRounded />}
                    {...a11yProps(6)}
                  />
                </Tabs>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={400}
                  sx={{
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </OpenLayout>
  )
}
