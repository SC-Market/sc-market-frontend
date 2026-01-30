import {
  Box,
  Button,
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
import React from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import { marketDrawerWidth, useMarketSidebar } from ".."
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { SearchRounded } from "@mui/icons-material"
import { SelectGameCategoryOption } from "../../../components/select/SelectGameItem"
import CloseIcon from "@mui/icons-material/CloseRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import FilterListIcon from "@mui/icons-material/FilterList"
import { LanguageFilter } from "../../../components/search/LanguageFilter"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { useMarketFilters } from "../hooks/useMarketFilters"
import type { SaleTypeSelect } from "../domain/types"

export function MarketSearchArea(props: { status?: boolean }) {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()
  const {
    sort,
    setSort,
    saleType,
    setSaleType,
    itemType,
    setItemType,
    quantityAvailable,
    setQuantityAvailable,
    minCost,
    setMinCost,
    maxCost,
    setMaxCost,
    query,
    setQuery,
    statuses,
    setStatuses,
    languageCodes,
    setLanguageCodes,
    applyFilters,
  } = useMarketFilters()

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        display: "flex",
        padding: theme.spacing(1),
        borderColor: theme.palette.outline.main,
      }}
    >
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Button
            onClick={applyFilters}
            startIcon={<SearchRounded />}
            variant={"contained"}
          >
            {t("MarketSearchArea.searchBtn")}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("MarketSearchArea.search")}
            size={"small"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            color={"secondary"}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("MarketSearchArea.sorting")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size={"small"}
            label={t("MarketSearchArea.sortAttribute")}
            value={sort || ""}
            onChange={(e) => setSort(e.target.value || null)}
            color={"secondary"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={""}>{t("MarketSearchArea.none")}</MenuItem>
            <MenuItem value={"title"}>{t("MarketSearchArea.title")}</MenuItem>
            <MenuItem value={"price-low"}>
              {t("MarketSearchArea.priceLowHigh")}
            </MenuItem>
            <MenuItem value={"price-high"}>
              {t("MarketSearchArea.priceHighLow")}
            </MenuItem>
            <MenuItem value={"quantity-low"}>
              {t("MarketSearchArea.quantityLowHigh")}
            </MenuItem>
            <MenuItem value={"quantity-high"}>
              {t("MarketSearchArea.quantityHighLow")}
            </MenuItem>
            <MenuItem value={"date-new"}>
              {t("MarketSearchArea.dateOldNew")}
            </MenuItem>
            <MenuItem value={"date-old"}>
              {t("MarketSearchArea.dateNewOld")}
            </MenuItem>
            <MenuItem value={"activity"}>
              {t("MarketSearchArea.activity")}
            </MenuItem>
            <MenuItem value={"rating"}>{t("MarketSearchArea.rating")}</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("MarketSearchArea.filtering")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <LanguageFilter
            selectedLanguages={languageCodes}
            onChange={setLanguageCodes}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("MarketSearchArea.quantityAvailable")}
            color={"secondary"}
            size={"small"}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              inputMode: "numeric",
            }}
            onChange={(e) => setQuantityAvailable(+(e.target.value || 0))}
          />
        </Grid>
        {props.status && (
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              value={statuses || ""}
              onChange={(e) => setStatuses(e.target.value)}
              label={t("MarketSearchArea.listingStatus")}
              size={"small"}
              color={"secondary"}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            >
              <MenuItem value={"active"}>
                {t("MarketSearchArea.active")}
              </MenuItem>
              <MenuItem value={"active,inactive"}>
                {t("MarketSearchArea.activeAndInactive")}
              </MenuItem>
              <MenuItem value={"active,inactive,archived"}>
                {t("MarketSearchArea.allStatuses")}
              </MenuItem>
            </TextField>
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            value={saleType}
            onChange={(e) => setSaleType(e.target.value as SaleTypeSelect)}
            label={t("MarketSearchArea.saleType")}
            color={"secondary"}
            size={"small"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={"any"}>{t("MarketSearchArea.any")}</MenuItem>
            <MenuItem value={"sale"}>{t("MarketSearchArea.sale")}</MenuItem>
            <MenuItem value={"aggregate"}>
              {t("MarketSearchArea.commodity")}
            </MenuItem>
            <MenuItem value={"auction"}>
              {t("MarketSearchArea.auction")}
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <SelectGameCategoryOption
            item_type={itemType}
            onTypeChange={setItemType}
            TextfieldProps={{
              size: "small",
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("MarketSearchArea.cost")}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("MarketSearchArea.minCost")}
            onChange={(e) => setMinCost(+(e.target.value || 0))}
            value={minCost}
            size={"small"}
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
            value={maxCost == null ? "" : maxCost}
            onChange={(e) =>
              setMaxCost(e.target.value ? +(e.target.value || 0) : null)
            }
            label={t("MarketSearchArea.maxCost")}
            size={"small"}
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
      </Grid>
    </Box>
  )
}

export function MarketSidebar(props: { status?: boolean }) {
  const { status } = props

  const [drawerOpen] = useDrawerOpen()
  const [open, setOpen] = useMarketSidebar()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("market.filters", "Filters")}
        maxHeight="90vh"
      >
        <MarketSearchArea status={status} />
      </BottomSheet>
    )
  }

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
          left: drawerOpen ? sidebarDrawerWidth : 0,
          transition: theme.transitions.create(
            ["width", "borderRight", "borderColor"],
            {
              easing: theme.transitions.easing.easeOut,
              duration: "0.3s",
            },
          ),
          borderRight: open ? 1 : 0,
          borderColor: open ? theme.palette.outline.main : "transparent",
        },
        position: "relative",
        whiteSpace: "nowrap",
        background: "transparent",
        overflow: "scroll",
        borderRight: open ? 1 : 0,
        borderColor: open ? theme.palette.outline.main : "transparent",
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

      <MarketSearchArea status={status} />
    </Drawer>
  )
}

export function MarketSideBarToggleButton() {
  const [open, setOpen] = useMarketSidebar()
  const theme = useTheme<ExtendedTheme>()
  const [drawerOpen] = useDrawerOpen()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  if (isMobile) {
    return (
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<FilterListIcon />}
        aria-label={t("market.toggleSidebar")}
        onClick={() => setOpen((value) => !value)}
        sx={{
          position: "fixed",
          bottom: { xs: 80, sm: 24 },
          right: 24,
          zIndex: theme.zIndex.speedDial,
          borderRadius: 2,
          textTransform: "none",
          boxShadow: theme.shadows[4],
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {t("market.filters", "Filters")}
      </Button>
    )
  }

  return (
    <IconButton
      color="secondary"
      aria-label={t("market.toggleSidebar")}
      sx={{
        zIndex: theme.zIndex.drawer - 2,
        position: "absolute",
        left: (drawerOpen ? sidebarDrawerWidth : 0) + 24,
        top: 64 + 24,
      }}
      onClick={() => setOpen((value) => !value)}
    >
      {open ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
  )
}
