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

export function RecruitingSidebar() {
  const theme: ExtendedTheme = useTheme()

  // Search fields
  const [fields, setFields] = useState<ContractorKindIconKey[]>([])
  const [rating, setRating] = useState<number>(0)
  const [query, setQuery] = useState<string>("")
  const [sorting, setSorting] =
    useState<RecruitingSearchState["sorting"]>("activity")

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
    }))
  }, [fields, setSearchState, query, rating, sorting])

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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <IconButton onClick={() => setOpen(false)} color={"secondary"}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={"Search"}
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
              Sorting
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              value={sorting}
              label="Sort Attribute"
              onChange={handleSortChange}
              color={"secondary"}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            >
              <MenuItem value={"activity"}>Activity</MenuItem>
              {/*<MenuItem value={'activity-reverse'}>Name (Z to A)</MenuItem>*/}
              <MenuItem value={"all-time"}>Upvotes (All time)</MenuItem>
              <MenuItem value={"rating"}>Rating (High to Low)</MenuItem>
              <MenuItem value={"rating-reverse"}>Rating (Low to High)</MenuItem>
              <MenuItem value={"name-reverse"}>Name (A to Z)</MenuItem>
              <MenuItem value={"name"}>Name (Z to A)</MenuItem>
              <MenuItem value={"members"}>Member Count (High to Low)</MenuItem>
              <MenuItem value={"members-reverse"}>
                Member Count (Low to High)
              </MenuItem>
              <MenuItem value={"date-reverse"}>
                Date Org Listed (Old to New)
              </MenuItem>
              <MenuItem value={"date"}>Date Org Listed (New to Old)</MenuItem>
              <MenuItem value={"post-date-reverse"}>
                Date Posted (Old to New)
              </MenuItem>
              <MenuItem value={"post-date"}>Date Posted (New to Old)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography variant={"subtitle2"} fontWeight={"bold"}>
              Filtering
            </Typography>
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
                  label="Org Tags"
                  placeholder="mining"
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
              Minimum Rating
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
