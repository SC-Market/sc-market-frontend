import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import React, { useEffect, useState } from "react"

import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../features/market"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { StarRounded } from "@mui/icons-material"
import {
  ContractorKindIconKey,
  contractorKindIcons,
  contractorKindIconsKeys,
} from "../contractor/ContractorList"
import { useRecruitingSidebar } from "../../hooks/recruiting/RecruitingSidebar"
import {
  RecruitingSearchState,
  useRecruitingSearch,
} from "../../hooks/recruiting/RecruitingSearch"
import { useTranslation } from "react-i18next"
import { LanguageFilter } from "../../components/search/LanguageFilter"
import { BottomSheet } from "../../components/mobile/BottomSheet"

export function RecruitingSidebar() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()

  // Search fields
  const [fields, setFields] = useState<ContractorKindIconKey[]>([])
  const [rating, setRating] = useState<number>(0)
  const [query, setQuery] = useState<string>("")
  const [sorting, setSorting] =
    useState<RecruitingSearchState["sorting"]>("activity")
  const [languageCodes, setLanguageCodes] = useState<string[]>([])

  // States
  const [open, setOpen] = useRecruitingSidebar()
  const [, setSearchState] = useRecruitingSearch()
  const [drawerOpen] = useDrawerOpen()

  const xs = useMediaQuery(theme.breakpoints.down("lg"))
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  useEffect(() => {
    setOpen(!xs)
  }, [setOpen, xs])

  const handleQueryChange = (event: { target: { value: string } }) => {
    setQuery(event.target.value)
  }

  const handleSortChange = (event: { target: { value: string } }) => {
    setSorting(event.target.value as typeof sorting)
  }

  useEffect(() => {
    setSearchState((state) => ({
      ...state,
      fields: fields,
      rating: rating,
      query: query,
      sorting,
      language_codes: languageCodes.length > 0 ? languageCodes : undefined,
    }))
  }, [fields, setSearchState, query, rating, sorting, languageCodes])

  // Content component to reuse
  const sidebarContent = (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        display: "flex",
        padding: { xs: theme.spacing(2), md: theme.spacing(3) },
        paddingTop: { xs: theme.spacing(2), md: theme.spacing(3) },
        borderColor: theme.palette.outline.main,
      }}
    >
      {/* Close button for desktop drawer */}
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("recruiting_sidebar.search")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            value={query}
            onChange={handleQueryChange}
            color={"secondary"}
          />
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
            value={sorting}
            label={t("recruiting_sidebar.sort_attribute")}
            onChange={handleSortChange}
            color={"secondary"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={"activity"}>
              {t("recruiting_sidebar.sort.activity")}
            </MenuItem>
            <MenuItem value={"all-time"}>
              {t("recruiting_sidebar.sort.upvotes_all_time")}
            </MenuItem>
            <MenuItem value={"rating"}>
              {t("recruiting_sidebar.sort.rating_high")}
            </MenuItem>
            <MenuItem value={"rating-reverse"}>
              {t("recruiting_sidebar.sort.rating_low")}
            </MenuItem>
            <MenuItem value={"name-reverse"}>
              {t("recruiting_sidebar.sort.name_a_z")}
            </MenuItem>
            <MenuItem value={"name"}>
              {t("recruiting_sidebar.sort.name_z_a")}
            </MenuItem>
            <MenuItem value={"members"}>
              {t("recruiting_sidebar.sort.members_high")}
            </MenuItem>
            <MenuItem value={"members-reverse"}>
              {t("recruiting_sidebar.sort.members_low")}
            </MenuItem>
            <MenuItem value={"date-reverse"}>
              {t("recruiting_sidebar.sort.date_old")}
            </MenuItem>
            <MenuItem value={"date"}>
              {t("recruiting_sidebar.sort.date_new")}
            </MenuItem>
            <MenuItem value={"post-date-reverse"}>
              {t("recruiting_sidebar.sort.post_old")}
            </MenuItem>
            <MenuItem value={"post-date"}>
              {t("recruiting_sidebar.sort.post_new")}
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("recruiting_sidebar.filtering")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <LanguageFilter
            selectedLanguages={languageCodes}
            onChange={setLanguageCodes}
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            fullWidth
            multiple
            filterSelectedOptions
            value={fields}
            onChange={(event: any, newValue) => {
              setFields(newValue || [])
            }}
            options={contractorKindIconsKeys}
            defaultValue={
              [] /* I don't know why it needs this dumb thing, but the types error without */
            }
            renderInput={(params: AutocompleteRenderInputParams) => (
              <TextField
                {...params}
                variant="outlined"
                label={t("recruiting_sidebar.org_tags")}
                placeholder={t("recruiting_sidebar.org_tags_placeholder")}
                fullWidth
                SelectProps={{
                  IconComponent: KeyboardArrowDownRoundedIcon,
                }}
              />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option: ContractorKindIconKey, index) => (
                // eslint-disable-next-line react/jsx-key
                <Chip
                  color={"primary"}
                  label={option}
                  sx={{ marginRight: 1, textTransform: "capitalize" }}
                  variant={"outlined"}
                  icon={contractorKindIcons[option]}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("recruiting_sidebar.min_rating")}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Rating
            name="half-rating"
            defaultValue={0}
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue!)
            }}
            precision={0.5}
            size={"large"}
            color={"white"}
            icon={<StarRounded fontSize="inherit" />}
            emptyIcon={
              <StarRounded
                style={{ color: theme.palette.text.primary }}
                fontSize="inherit"
              />
            }
          />
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
        title={t("recruiting_sidebar.filters", "Filters")}
        maxHeight="90vh"
      >
        {sidebarContent}
      </BottomSheet>
    )
  }

  // On desktop, use persistent Paper sidebar
  return (
    <Paper
      sx={{
        position: "sticky",
        top: "calc(64px + 16px)",
        maxHeight: "calc(100vh - 64px - 32px)",
        width: 300,
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      {sidebarContent}
    </Paper>
  )
}
