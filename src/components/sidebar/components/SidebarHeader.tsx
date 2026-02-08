import React from "react"
import {
  Avatar,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { ChevronLeftRounded, SearchRounded } from "@mui/icons-material"
import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { SidebarActorSelect } from "../SidebarActorSelect"
import { HapticIconButton } from "../../haptic"

interface SidebarHeaderProps {
  avatar: string
  profile: any
  searchQuery: string
  onSearchChange: (value: string) => void
}

/**
 * Sidebar header with logo, org selector, and search
 */
export function SidebarHeader({
  avatar,
  profile,
  searchQuery,
  onSearchChange,
}: SidebarHeaderProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [, setDrawerOpen] = useDrawerOpen()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Stack
      direction={"column"}
      spacing={theme.layoutSpacing.compact}
      sx={{
        width: "100%",
        display: "flex",
        padding: 2,
        borderColor: theme.palette.outline.main,
      }}
    >
      <Grid container sx={{ justifyContent: "space-between" }}>
        <Grid item>
          <NavLink
            to={"/"}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Stack
              direction={"row"}
              spacing={theme.layoutSpacing.compact}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Avatar
                src={avatar}
                aria-label={t("ui.aria.currentContractor")}
                variant={"rounded"}
                sx={{
                  maxHeight: theme.spacing(6),
                  maxWidth: theme.spacing(6),
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Typography
                color={theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                )}
                fontWeight={600}
              >
                {t("sidebar.sc_market")}
              </Typography>
            </Stack>
          </NavLink>
        </Grid>

        <HapticIconButton
          color={"secondary"}
          onClick={() => setDrawerOpen(false)}
          sx={{ height: 40, width: 40 }}
        >
          <ChevronLeftRounded />
        </HapticIconButton>
      </Grid>
      {profile && <SidebarActorSelect />}
      {xs && (
        <TextField
          size="small"
          placeholder={t("sidebar.search", "Search...")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            mt: 1,
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.palette.background.paper,
              "& fieldset": {
                borderColor: theme.palette.outline.main,
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
          }}
        />
      )}
    </Stack>
  )
}
