import { useTheme } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import React, { useEffect, useState } from "react"

import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../features/market/index"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useContractSidebar } from "../../hooks/contract/ContractSidebar"
import { useContractSearch } from "../../hooks/contract/ContractSearch"
import { orderIcons } from "../../datatypes/Order"
import { PAYMENT_TYPES } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { LanguageFilter } from "../../components/search/LanguageFilter"
import { BottomSheet } from "../../components/mobile/BottomSheet"

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
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';

export function ContractSidebar() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()

  // Search fields
  const [kind, setKind] = useState<string>("Any")
  const [minOffer, setMinOffer] = useState<number>(0)
  const [maxOffer, setMaxOffer] = useState<number | null>(null)
  const [query, setQuery] = useState<string>("")
  const [paymentType, setPaymentType] = useState<string>("any")
  const [sort, setSort] = useState<string>("date-old")
  const [languageCodes, setLanguageCodes] = useState<string[]>([])

  // States
  const [open, setOpen] = useContractSidebar()
  const [, setSearchState] = useContractSearch()
  const [drawerOpen] = useDrawerOpen()

  const xs = useMediaQuery(theme.breakpoints.down("lg"))
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Always open on desktop
  useEffect(() => {
    if (!isMobile) {
      setOpen(true)
    }
  }, [setOpen, isMobile])

  const handleKindChange = (event: { target: { value: string } }) => {
    setKind(event.target.value)
  }
  const handleMinCostChange = (event: { target: { value: string } }) => {
    setMinOffer(+event.target.value || 0)
  }
  const handleMaxCostChange = (event: { target: { value: string } }) => {
    setMaxOffer(event.target.value ? +event.target.value || null : null)
  }
  const handlePaymentTypeChange = (event: { target: { value: string } }) => {
    setPaymentType(event.target.value)
  }
  const handleQueryChange = (event: { target: { value: string } }) => {
    setQuery(event.target.value)
  }
  const handleSortChange = (event: { target: { value: string } }) => {
    setSort(event.target.value)
  }
  const handleLanguageCodesChange = (codes: string[]) => {
    setLanguageCodes(codes)
  }

  useEffect(() => {
    setSearchState((state) => ({
      ...state,
      kind: kind === "Any" ? undefined : kind,
      minOffer: minOffer,
      maxOffer: maxOffer,
      query: query,
      paymentType: paymentType === "any" ? undefined : paymentType,
      sort: sort,
      language_codes: languageCodes.length > 0 ? languageCodes : undefined,
    }))
  }, [
    kind,
    setSearchState,
    query,
    minOffer,
    maxOffer,
    paymentType,
    sort,
    languageCodes,
  ])

  // Content component to reuse in both Drawer and BottomSheet
  const sidebarContent = (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        display: "flex",
        padding: theme.spacing(2),
        borderColor: theme.palette.outline.main,
      }}
    >
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={t("service_search.search")}
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
            value={query}
            onChange={handleQueryChange}
            color={"secondary"}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("service_search.filtering")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <LanguageFilter
            selectedLanguages={languageCodes}
            onChange={handleLanguageCodesChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            value={kind}
            label={t("service_search.contract_type")}
            onChange={handleKindChange}
            color={"secondary"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={"Any"}>
              {t("service_search.contract_types.Any")}
            </MenuItem>
            {Object.keys(orderIcons).map((k) => (
              <MenuItem value={k} key={k}>
                {t(`orderKinds.${k}`, k)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("recruiting_sidebar.sorting")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("recruiting_sidebar.sort_attribute")}
            value={sort || ""}
            onChange={handleSortChange}
            color={"secondary"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={""}>{t("market.none")}</MenuItem>
            <MenuItem value={"title"}>{t("market.title")}</MenuItem>
            <MenuItem value={"price-low"}>
              {t("market.price_low_to_high")}
            </MenuItem>
            <MenuItem value={"price-high"}>
              {t("market.price_high_to_low")}
            </MenuItem>
            <MenuItem value={"date-new"}>
              {t("market.date_old_to_new")}
            </MenuItem>
            <MenuItem value={"date-old"}>
              {t("market.date_new_to_old")}
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("service_search.cost")}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            value={minOffer}
            label={t("service_search.min_cost")}
            onChange={handleMinCostChange}
            color={"secondary"}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
              inputMode: "numeric",
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            value={maxOffer == null ? "" : maxOffer}
            label={t("service_search.max_cost")}
            onChange={handleMaxCostChange}
            color={"secondary"}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
              inputMode: "numeric",
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            size="small"
            label={t("service_search.payment_type")}
            value={paymentType}
            onChange={handlePaymentTypeChange}
            fullWidth
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={"any"}>
              {t("service_search.payment_types.any")}
            </MenuItem>
            {PAYMENT_TYPES.slice(0, 3).map((paymentType) => (
              <MenuItem key={paymentType.value} value={paymentType.value}>
                {t(`service_search.payment_types.${paymentType.value}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  )

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("service_search.filters", "Filters")}
        snapPoints={["half", "75", "full"]}
        defaultSnap="75"
      >
        {sidebarContent}
      </BottomSheet>
    )
  }

  // On desktop, return content directly (wrapped in Paper by parent)
  return sidebarContent
}
