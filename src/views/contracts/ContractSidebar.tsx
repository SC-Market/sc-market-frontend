import {
  Box,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import CloseIcon from "@mui/icons-material/Close"
import React, { useEffect, useState } from "react"

import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../hooks/market/MarketSidebar"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useContractSidebar } from "../../hooks/contract/ContractSidebar"
import { useContractSearch } from "../../hooks/contract/ContractSearch"
import { orderIcons } from "../../datatypes/Order"
import { PAYMENT_TYPES } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { LanguageFilter } from "../../components/search/LanguageFilter"

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
  useEffect(() => {
    setOpen(!xs)
  }, [setOpen, xs])

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
  }, [kind, setSearchState, query, minOffer, maxOffer, paymentType, sort, languageCodes])

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        zIndex: theme.zIndex.drawer - 3,
        width: open ? marketDrawerWidth : 0,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: open ? marketDrawerWidth : 0,
          boxSizing: "border-box",
          overflow: "scroll",
          [theme.breakpoints.up("sm")]: {
            left: drawerOpen ? sidebarDrawerWidth : 0,
          },
          [theme.breakpoints.down("sm")]: {
            left: 0,
          },
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.easeOut,
            duration: "0.3s",
          }),
          borderColor: theme.palette.outline.main,
        },
        position: "relative",
        whiteSpace: "nowrap",
        // backgroundColor: "#132321",
        // backgroundRepeat: 'no-repeat',
        // backgroundPosition: 'center',
        // backgroundSize: "cover",
        background: "transparent",
        overflow: "scroll",
        borderColor: theme.palette.outline.main,
      }}
      container={
        window !== undefined
          ? () => window.document.getElementById("rootarea")
          : undefined
      }
    >
      <Box
        sx={{
          ...theme.mixins.toolbar,
          position: "relative",
          width: "100%",
        }}
      />
      <Box
        sx={{
          width: "100%",
          height: "100%",
          flexDirection: "column",
          display: "flex",
          padding: theme.spacing(3),
          paddingTop: theme.spacing(3),
          borderColor: theme.palette.outline.main,
        }}
      >
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <IconButton
              onClick={() => setOpen(false)}
              color={"secondary"}
              aria-label={t("service_market.toggle_sidebar")}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
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
    </Drawer>
  )
}
