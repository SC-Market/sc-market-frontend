import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Chip,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Rating,
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
        sx={{ ...theme.mixins.toolbar, position: "relative", width: "100%" }}
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <IconButton onClick={() => setOpen(false)} color={"secondary"}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("recruiting_sidebar.search")}
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
    </Drawer>
  )
}
