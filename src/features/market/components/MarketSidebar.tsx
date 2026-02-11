import { useTheme } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { useMarketSidebar } from ".."
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { SelectGameCategoryOption } from "../../../components/select/SelectGameItem"
import FilterListIcon from "@mui/icons-material/FilterList"
import { LanguageFilter } from "../../../components/search/LanguageFilter"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { useMarketFilters } from "../hooks/useMarketFilters"
import type { SaleTypeSelect } from "../domain/types"
import { AttributeFilterSection } from "../../../components/filters/AttributeFilterSection"
import { marketApi } from "../api/marketApi"
import { debounce } from "lodash"
import { useBottomNavHeight } from "../../../hooks/layout/useBottomNavHeight"
import type { MarketListing } from "../../../datatypes/MarketListing"

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

export function MarketSearchArea(props: {
  status?: boolean
  hideSearchBar?: boolean
}) {
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
    attributes,
    setAttributes,
    availableAttributes,
    applyFilters,
  } = useMarketFilters()

  const [searchTrigger] = marketApi.useLazySearchMarketListingsQuery()
  const [itemOptions, setItemOptions] = useState<string[]>([])

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.length > 1) {
          const result = await searchTrigger({
            query: searchQuery,
            index: 0,
            page_size: 10,
            sort: "title",
          })
          if (result.data?.listings) {
            const uniqueNames = [
              ...new Set(
                result.data.listings
                  .map((item) => item.item_name)
                  .filter((name): name is string => name !== null),
              ),
            ]
            setItemOptions(uniqueNames)
          }
        }
      }, 300),
    [searchTrigger],
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return (
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
        {!props.hideSearchBar && (
          <>
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
              <Autocomplete
                freeSolo
                size="small"
                options={itemOptions}
                value={query}
                onInputChange={(event, newValue) => {
                  setQuery(newValue)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("MarketSearchArea.search")}
                    size="small"
                    color="secondary"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <IconButton size="small">
                              <SearchIcon />
                            </IconButton>
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </>
        )}
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

        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("MarketSearchArea.itemType", "Item Type")}
          </Typography>
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

        {/* Attribute Filters Section */}
        {availableAttributes.length > 0 && (
          <>
            <Grid item xs={12}>
              <Typography variant={"subtitle2"} fontWeight={"bold"}>
                {t("MarketSearchArea.itemAttributes", "Item Attributes")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {[...availableAttributes]
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((attr) => (
                    <AttributeFilterSection
                      key={attr.attribute_name}
                      attributeName={attr.attribute_name}
                      displayName={attr.display_name}
                      attributeType={attr.attribute_type}
                      allowedValues={attr.allowed_values}
                      selectedValues={attributes[attr.attribute_name] || []}
                      onChange={(values) =>
                        setAttributes({
                          ...attributes,
                          [attr.attribute_name]: values,
                        })
                      }
                    />
                  ))}
              </Box>
            </Grid>
          </>
        )}
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

  // Mobile: Use bottom sheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("market.filters", "Filters")}
        snapPoints={["half", "75", "full"]}
        defaultSnap="75"
      >
        <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
          <MarketSearchArea status={status} />
        </Box>
      </BottomSheet>
    )
  }

  // Desktop: Render as persistent sidebar content (no drawer)
  return <MarketSearchArea status={status} />
}

export function MarketSideBarToggleButton() {
  const [open, setOpen] = useMarketSidebar()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const bottomNavHeight = useBottomNavHeight()
  const { t } = useTranslation()

  // Only show toggle button on mobile
  if (!isMobile) {
    return null
  }

  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={<FilterListIcon />}
      aria-label={t("market.toggleSidebar")}
      onClick={() => setOpen((value) => !value)}
      sx={{
        position: "fixed",
        bottom: bottomNavHeight + 16,
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
