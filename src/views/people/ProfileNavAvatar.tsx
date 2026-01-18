import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  LogoutRounded,
  PeopleRounded,
  SettingsRounded,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLogoutMutation } from "../../store/profile"
import { useDispatch } from "react-redux"
import { serviceApi } from "../../store/service"
import { tokensApi } from "../../store/tokens"

export function ProfileNavAvatar() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const notifOpen = Boolean(anchorEl)
  const theme = useTheme<ExtendedTheme>()
  const { data: profile } = useGetUserProfileQuery()
  const { t } = useTranslation()
  const [logout] = useLogoutMutation()
  const dispatch = useDispatch()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    handleClose()

    try {
      // Clear service worker caches
      if ("serviceWorker" in navigator && "caches" in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map((cacheName) => {
              // Clear API cache and other caches that might contain authenticated data
              if (
                cacheName.includes("api") ||
                cacheName.includes("pages") ||
                cacheName.includes("mutations")
              ) {
                return caches.delete(cacheName)
              }
              return Promise.resolve()
            }),
          )
        } catch (error) {
          console.error("Failed to clear service worker caches:", error)
        }
      }

      // Clear RTK Query cache (also done in mutation's onQueryStarted, but do it here too for immediate effect)
      dispatch(serviceApi.util.resetApiState())
      dispatch(tokensApi.util.resetApiState())

      // Call logout mutation
      await logout().unwrap()

      // Redirect to home page after successful logout
      window.location.href = "/"
    } catch (error) {
      // Even if logout fails, redirect to home (session might be cleared anyway)
      console.error("Logout error:", error)
      window.location.href = "/"
    }
  }

  return (
    <React.Fragment>
      {/*{redirect && <Navigate to={redirect}/>}*/}
      <IconButton onClick={handleClick}>
        <Avatar src={profile?.avatar} />
      </IconButton>
      <Popover
        open={notifOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          variant: "outlined",
          sx: {
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
            borderColor: theme.palette.outline.main,
          },
        }}
      >
        <Box>
          <List
            sx={{
              "&>:last-child": {
                borderBottom: "none",
              },
              "& > *": {
                borderBottom: `1px solid ${theme.palette.outline.main}`,
              },
              padding: 0,
              maxHeight: 400,
              overflow: "scroll",
            }}
          >
            <Link
              to={`/user/${profile?.username}`}
              style={{ color: "inherit", textDecoration: "none" }}
              onClick={handleClose}
            >
              <ListItemButton>
                <ListItemIcon
                  sx={{
                    transition: "0.3s",
                    fontSize: "0.9em",
                    color: theme.palette.primary.main,
                  }}
                >
                  <PeopleRounded />
                </ListItemIcon>
                <ListItemText sx={{ maxWidth: 300 }}>
                  <Typography noWrap color={"text.secondary"}>
                    {t("profileNavAvatar.profile")}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </Link>
            <Link
              to={"/settings"}
              style={{ color: "inherit", textDecoration: "none" }}
              onClick={handleClose}
            >
              <ListItemButton>
                <ListItemIcon
                  sx={{
                    transition: "0.3s",
                    fontSize: "0.9em",
                    color: theme.palette.primary.main,
                  }}
                >
                  <SettingsRounded />
                </ListItemIcon>
                <ListItemText sx={{ maxWidth: 300 }}>
                  <Typography noWrap color={"text.secondary"}>
                    {t("profileNavAvatar.settings")}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </Link>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon
                sx={{
                  transition: "0.3s",
                  fontSize: "0.9em",
                  color: theme.palette.primary.main,
                }}
              >
                <LogoutRounded />
              </ListItemIcon>
              <ListItemText sx={{ maxWidth: 300 }}>
                <Typography noWrap color={"text.secondary"}>
                  {t("profileNavAvatar.logout")}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </List>
        </Box>
      </Popover>
    </React.Fragment>
  )
}
