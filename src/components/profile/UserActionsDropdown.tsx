import React, { useState } from "react"
import { useUserActions } from "../../features/profile/hooks/useUserActions"
import {
  IconButton,
  Popover,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material"
import { ArrowDropDown, Link as LinkIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { User } from "../../datatypes/User"
import {
  useProfileGetBlocklistQuery,
  useGetUserProfileQuery,
} from "../../features/profile/api/profileApi"

import { BlockUserButton, BlockUserForOrgButton } from "./BlockUserButton"
import { UnblockUserButton, UnblockUserForOrgButton } from "./UnblockUserButton"

import { ManageAccountsRounded as ManageAccountsIcon } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"
import { ADMIN_PATHS } from "../../routes/paths"

interface UserActionsDropdownProps {
  user: User
}

export function UserActionsDropdown({ user }: UserActionsDropdownProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const {
    myProfile, contractor,
    isPersonallyBlocked, isSelf, isOrgBlocked, isAdmin,
    personalBlocklistLoading, orgBlocklistLoading,
  } = useUserActions(user.username)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleViewRSIPage = () => { window.open(`https://robertsspaceindustries.com/citizens/${user.username}`, "_blank"); handleClose() }
  const handleSuccess = () => handleClose()

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          ml: 0.5,
          color: "text.secondary",
        }}
        aria-label={t("userActions.menu")}
      >
        <ArrowDropDown />
      </IconButton>
      <Popover
        open={open}
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
              minWidth: 200,
            }}
          >
            <ListItemButton onClick={handleViewRSIPage}>
              <ListItemIcon
                sx={{
                  transition: "0.3s",
                  fontSize: "0.9em",
                  color: theme.palette.primary.main,
                }}
              >
                <LinkIcon />
              </ListItemIcon>
              <ListItemText>
                <Box color={"text.secondary"} fontSize="0.9em">
                  {t("userActions.viewRSIPage")}
                </Box>
              </ListItemText>
            </ListItemButton>

            {!isSelf &&
              (isPersonallyBlocked ? (
                <UnblockUserButton
                  user={user}
                  onSuccess={handleSuccess}
                  disabled={personalBlocklistLoading}
                />
              ) : (
                <BlockUserButton
                  user={user}
                  myUsername={myProfile?.username || ""}
                  onSuccess={handleSuccess}
                  disabled={personalBlocklistLoading}
                />
              ))}

            {contractor &&
              (isOrgBlocked ? (
                <UnblockUserForOrgButton
                  user={user}
                  spectrumId={contractor.spectrum_id}
                  onSuccess={handleSuccess}
                  disabled={orgBlocklistLoading}
                />
              ) : (
                <BlockUserForOrgButton
                  user={user}
                  orgName={contractor.name}
                  spectrumId={contractor.spectrum_id}
                  onSuccess={handleSuccess}
                  disabled={orgBlocklistLoading}
                />
              ))}

            {isAdmin && (
              <ListItemButton
                component={RouterLink}
                to={`${ADMIN_PATHS.identity}?q=${encodeURIComponent(user.username)}`}
                onClick={handleClose}
              >
                <ListItemIcon sx={{ transition: "0.3s", fontSize: "0.9em", color: theme.palette.primary.main }}>
                  <ManageAccountsIcon />
                </ListItemIcon>
                <ListItemText>
                  <Box color={"text.secondary"} fontSize="0.9em">
                    {t("userActions.adminOpenIdentity", "Open in Admin -> Identity")}
                  </Box>
                </ListItemText>
              </ListItemButton>
            )}
          </List>
        </Box>
      </Popover>

    </>
  )
}
