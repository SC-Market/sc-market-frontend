import {
  AppBar,
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  PaperProps,
  TextField,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import SearchIcon from "@mui/icons-material/Search"
import { FilterAltRounded, SearchRounded } from "@mui/icons-material"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { NotificationsButton } from "./NotificationsButton"
import { ProfileNavAvatar } from "../../views/people/ProfileNavAvatar"
import { DiscordLoginButton } from "../button/DiscordLoginButton"
import { useGetUserProfileQuery } from "../../store/profile"
import { useMarketSidebar } from "../../hooks/market/MarketSidebar"
import { useSearchParams } from "react-router-dom"
import { useMarketSearch } from "../../hooks/market/MarketSearch"
import { SelectGameCategoryOption } from "../select/SelectGameItem"

export function MarketNavEntry(
  props: { title: string; children: React.ReactElement } & PaperProps,
) {
  const { title, children, ...paperProps } = props
  const theme = useTheme<Theme>()

  return (
    <Paper
      variant={"outlined"}
      sx={{
        borderColor: theme.palette.outline.main,
        display: "flex",
        padding: 1,
        alignItems: "center",
        justifyContent: "center",
        ...paperProps.sx,
      }}
      {...paperProps}
    >
      <Typography sx={{ marginRight: 1 }}>{title}</Typography>
      {children}
    </Paper>
  )
}

export function useOnScreen(ref?: RefObject<HTMLElement | null> | null) {
  if (!ref) {
    return false
  }

  const [isIntersecting, setIntersecting] = useState(false)

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting),
      ),
    [ref],
  )

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [])

  return isIntersecting
}

export function HideOnScroll(props: { children: React.ReactNode }) {
  const { children } = props

  const ref = useRef<HTMLDivElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const isVisible = useOnScreen(ref) || !loaded

  const theme = useTheme()
  const drawerOpen = useDrawerOpen()

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <>
      <AppBar
        variant={"outlined"}
        sx={{
          zIndex: theme.zIndex.drawer - 1,
          transition: "opacity .25s linear, top .5s ease-in-out",
          top: isVisible ? -64 : 0,
          paddingTop: 2,
          // visibility: isVisible ? 'hidden' : undefined,
          opacity: isVisible ? "0" : "1",
          // height: isVisible ? undefined : 0,
          // marginLeft: (drawerOpen ? sidebarDrawerWidth : 0),
          // width: `calc(100% - ${(drawerOpen ? sidebarDrawerWidth : 1) - 1}px)`,

          [theme.breakpoints.up("sm")]: {
            marginLeft: drawerOpen ? sidebarDrawerWidth : 0,
            width: `calc(100% - ${
              (drawerOpen ? sidebarDrawerWidth : 1) - 1
            }px)`,
          },
          [theme.breakpoints.down("sm")]: {
            width: drawerOpen ? 0 : "100%",
          },
          [theme.breakpoints.down("md")]: {
            display: "none",
          },

          // transition: theme.transitions.create(['width', 'margin'], {
          //         easing: theme.transitions.easing.easeOut,
          //         duration: '0.3s',
          //     }
          // ),
          background: theme.palette.background.default,
          // background: 'transparent',
          overflow: "hidden",
          // borderColor: theme.palette.outline.main,
          // borderBottom: 1,
          "& .MuiAppBar-root": {
            backgroundColor: "rgba(0,0,0,0)",
            // backgroundColor: theme.palette.background.default
            overflow: "hidden",
          },
        }}
        color={"secondary"}
      >
        <Toolbar
          sx={{
            paddingRight: 2, // keep right padding when drawer closed
            // boxShadow: `0 3px 5px 3px ${theme.palette.primary.main}`,
            overflow: "visible",
            background: "transparent",
            paddingLeft: 0,
            ...(theme.navKind === "outlined"
              ? {}
              : {
                  border: "none",
                  boxShadow:
                    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
                }),
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Box>
              <MarketNavArea top />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          [theme.breakpoints.down("md")]: {
            display: "none",
          },
        }}
      >
        {children}
      </Box>
      <div ref={ref} />
    </>
  )
}

export function MarketNavArea(props: { top?: boolean }) {
  const [filterOpen, setFilterOpen] = useState(false)
  const theme = useTheme()
  const profile = useGetUserProfileQuery()

  const [searchParams, setSearchParams] = useSearchParams()

  const [searchState, setMarketSearch] = useMarketSearch()
  const [sort, setSort] = useState<string | null>(searchState.sort || null)
  const [kind, setKind] = useState<string>(searchState.sale_type || "any")
  const [type, setType] = useState<string | null>(searchState.item_type || null)
  const [quantityAvailable, setQuantityAvailable] = useState<number>(
    searchState.quantityAvailable !== undefined
      ? searchState.quantityAvailable
      : 1,
  )
  const [minCost, setMinCost] = useState<number>(searchState.minCost || 0)
  const [maxCost, setMaxCost] = useState<number | null>(
    searchState.maxCost || null,
  )
  const [query, setQuery] = useState<string>(searchState.query || "")
  const [activity, setActivity] = useState<string>(
    searchState.status ? "active" : "",
  )
  const [drawerOpen] = useDrawerOpen()
  const [open, setOpen] = useMarketSidebar()

  // const xs = useMediaQuery(theme.breakpoints.down('lg'));
  // useEffect(() => {
  //     setOpen(!xs)
  // }, [setOpen, xs])

  const handleKindChange = (event: { target: { value: string } }) => {
    setKind(event.target.value)
  }
  const handleSortChange = (event: { target: { value: string } }) => {
    setSort(event.target.value || null)
  }
  const handleTypeChange = (value: string | null) => {
    setType(value)
  }
  const handleQuantityChange = (event: { target: { value: string } }) => {
    setQuantityAvailable(+event.target.value || 0)
  }
  const handleMinCostChange = (event: { target: { value: string } }) => {
    setMinCost(+event.target.value || 0)
  }
  const handleMaxCostChange = (event: { target: { value: string } }) => {
    setMaxCost(event.target.value ? +event.target.value || null : null)
  }
  const handleQueryChange = (event: { target: { value: string } }) => {
    setQuery(event.target.value)
  }
  const handleActivityChange = (event: { target: { value: string } }) => {
    setActivity(event.target.value)
  }

  const searchClickCallback = useCallback(() => {
    setMarketSearch({
      sale_type: kind,
      item_type: type || undefined,
      quantityAvailable,
      minCost,
      maxCost,
      query,
      sort,
      status: activity,
    })
  }, [
    activity,
    kind,
    maxCost,
    minCost,
    quantityAvailable,
    query,
    setMarketSearch,
    sort,
    type,
  ])

  useEffect(() => {
    setType(searchParams.get("type") || "any")
  }, [searchParams])

  return (
    <>
      <Grid container justifyContent={"space-between"} spacing={1}>
        <Grid item>
          <Grid container spacing={1}>
            <Grid item sx={{ paddingTop: 2 }}>
              <TextField
                fullWidth
                label={"Search Query"}
                InputProps={{
                  startAdornment: <SearchIcon />,
                }}
                value={query}
                onChange={handleQueryChange}
                color={"secondary"}
                size={"small"}
              />
            </Grid>

            <Grid item sx={{ paddingTop: 2 }}>
              <Tooltip title="Filters">
                <IconButton onClick={() => setFilterOpen((o) => !o)}>
                  <FilterAltRounded
                    style={{
                      color: filterOpen
                        ? theme.palette.secondary.main
                        : theme.palette.getContrastText(
                            theme.palette.background.default,
                          ),
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Grid>

            <Grid item sx={{ paddingTop: 2 }}>
              <Button
                onClick={searchClickCallback}
                startIcon={<SearchRounded />}
                variant={"contained"}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {props.top && (
          <Grid item sx={{ paddingTop: 1 }}>
            {profile.data ? (
              <Box sx={{ display: "flex" }}>
                <NotificationsButton />
                <ProfileNavAvatar />
              </Box>
            ) : (
              <DiscordLoginButton />
            )}
          </Grid>
        )}
        <Grid item xs={12} sx={{ paddingBottom: 1 }}>
          <Collapse in={filterOpen}>
            <Grid container spacing={1} sx={{ padding: "none" }}>
              <Grid item xs={12} md={4} lg={4}>
                <TextField
                  select
                  fullWidth
                  label="Sort By"
                  color={"secondary"}
                  value={sort || ""}
                  onChange={handleSortChange}
                  SelectProps={{
                    IconComponent: KeyboardArrowDownRoundedIcon,
                  }}
                  size={"small"}
                >
                  <MenuItem value={""}>None</MenuItem>
                  <MenuItem value={"title"}>Title</MenuItem>
                  <MenuItem value={"price-low"}>Price (Low to High)</MenuItem>
                  <MenuItem value={"price-high"}>Price (High to Low)</MenuItem>
                  <MenuItem value={"quantity-low"}>
                    Quantity Available (Low to High)
                  </MenuItem>
                  <MenuItem value={"quantity-high"}>
                    Quantity Available (High to Low)
                  </MenuItem>
                  <MenuItem value={"date-new"}>
                    Date Listed (Old to New)
                  </MenuItem>
                  <MenuItem value={"date-old"}>
                    Date Listed (New to Old)
                  </MenuItem>
                  <MenuItem value={"activity"}>Recent Activity</MenuItem>
                  <MenuItem value={"rating"}>Rating (High to Low)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4} lg={4}>
                <TextField
                  fullWidth
                  label="Quantity Available"
                  color={"secondary"}
                  size={"small"}
                  onChange={handleQuantityChange}
                  value={quantityAvailable}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  InputProps={{
                    // endAdornment: <InputAdornment
                    //     position="start">
                    //     {`of ${listing.quantity_available} available`}
                    // </InputAdornment>,
                    inputMode: "numeric",
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4} lg={4}>
                <TextField
                  select
                  fullWidth
                  label="Sale Type"
                  size={"small"}
                  color={"secondary"}
                  value={kind}
                  onChange={handleKindChange}
                  SelectProps={{
                    IconComponent: KeyboardArrowDownRoundedIcon,
                  }}
                >
                  <MenuItem value={"any"}>Any</MenuItem>
                  <MenuItem value={"sale"}>Sale</MenuItem>
                  <MenuItem value={"aggregate"}>Aggregate</MenuItem>
                  <MenuItem value={"auction"}>Auction</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4} lg={4}>
                <SelectGameCategoryOption
                  item_type={type}
                  onTypeChange={handleTypeChange}
                  TextfieldProps={{
                    size: "small",
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4} lg={4}>
                <TextField
                  fullWidth
                  label="Min Cost"
                  size={"small"}
                  color={"secondary"}
                  onChange={handleMinCostChange}
                  value={minCost}
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
              <Grid item xs={12} md={4} lg={4}>
                <TextField
                  fullWidth
                  size={"small"}
                  label="Max Cost"
                  color={"secondary"}
                  value={maxCost == null ? "" : maxCost}
                  onChange={handleMaxCostChange}
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
          </Collapse>
        </Grid>
      </Grid>
    </>
  )
}
