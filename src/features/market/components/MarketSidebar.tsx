import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  Autocomplete,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { useMarketSidebar } from ".."
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { SearchRounded } from "@mui/icons-material"
import { SelectGameCategoryOption } from "../../../components/select/SelectGameItem"
import FilterListIcon from "@mui/icons-material/FilterList"
import { LanguageFilter } from "../../../components/search/LanguageFilter"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { useMarketFilters } from "../hooks/useMarketFilters"
import type { SaleTypeSelect } from "../domain/types"
import { AttributeFilterSection } from "../../../components/filters/AttributeFilterSection"
import { marketApi } from "../api/marketApi"
import { debounce } from "lodash"
import type { MarketListing } from "../../../datatypes/MarketListing"

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
        padding: theme.spacing(1),
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
