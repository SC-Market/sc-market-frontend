import React, { useState } from "react"
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
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useProfileGetBlocklistQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { useGetOrgBlocklistQuery } from "../../store/contractor"
import { BlockUserButton, BlockUserForOrgButton } from "./BlockUserButton"
import { UnblockUserButton, UnblockUserForOrgButton } from "./UnblockUserButton"
import { useAdminUnlinkUserAccountMutation } from "../../store/admin"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { LinkOff as LinkOffIcon } from "@mui/icons-material"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"

interface UserActionsDropdownProps {
  user: User
}

export function UserActionsDropdown({ user }: UserActionsDropdownProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [contractor] = useCurrentOrg()
  const { data: myProfile } = useGetUserProfileQuery()
  const [unlinkAccount, { isLoading: isUnlinking }] =
    useAdminUnlinkUserAccountMutation()
  const issueAlert = useAlertHook()
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)

  // Personal blocklist
  const { data: personalBlocklist = [], isLoading: personalBlocklistLoading } =
    useProfileGetBlocklistQuery()

  // Organization blocklist
  const { data: orgBlocklist = [], isLoading: orgBlocklistLoading } =
    useGetOrgBlocklistQuery(contractor?.spectrum_id || "", {
      skip: !contractor?.spectrum_id,
    })

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleViewRSIPage = () => {
    window.open(
      `https://robertsspaceindustries.com/citizens/${user.username}`,
      "_blank",
    )
    handleClose()
  }

  // Check if user is blocked personally
  const isPersonallyBlocked = personalBlocklist.some(
    (entry) => entry.blocked_user?.username === user.username,
  )

  // Check if user is viewing their own profile
  const isSelf = myProfile?.username === user.username

  // Check if user is blocked by organization
  const isOrgBlocked = orgBlocklist.some(
    (entry) => entry.blocked_user?.username === user.username,
  )

  const handleSuccess = () => {
    handleClose()
  }

  const handleUnlinkClick = () => {
    setUnlinkDialogOpen(true)
    handleClose()
  }

  const handleConfirmUnlink = async () => {
    try {
      await unlinkAccount({ username: user.username }).unwrap()
      issueAlert({
        message: t("userActions.adminUnlinkSuccess", {
          username: user.username,
        }),
        severity: "success",
      })
      setUnlinkDialogOpen(false)
    } catch (err: any) {
      issueAlert(err)
    }
  }

  const handleCancelUnlink = () => {
    setUnlinkDialogOpen(false)
  }

  const isAdmin = myProfile?.role === "admin"

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

            {isAdmin && user.rsi_confirmed && (
              <ListItemButton onClick={handleUnlinkClick}>
                <ListItemIcon
                  sx={{
                    transition: "0.3s",
                    fontSize: "0.9em",
                    color: theme.palette.error.main,
                  }}
                >
                  <LinkOffIcon />
                </ListItemIcon>
                <ListItemText>
                  <Box color={"text.secondary"} fontSize="0.9em">
                    {t("userActions.adminUnlinkAccount")}
                  </Box>
                </ListItemText>
              </ListItemButton>
            )}
          </List>
        </Box>
      </Popover>

      <Dialog
        open={unlinkDialogOpen}
        onClose={handleCancelUnlink}
        aria-labelledby="admin-unlink-dialog-title"
        aria-describedby="admin-unlink-dialog-description"
      >
        <DialogTitle id="admin-unlink-dialog-title">
          {t("userActions.adminUnlinkDialogTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="admin-unlink-dialog-description">
            {t("userActions.adminUnlinkDialogDescription", {
              username: user.username,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnlink}>
            {t("userActions.adminUnlinkDialogCancel")}
          </Button>
          <LoadingButton
            onClick={handleConfirmUnlink}
            color="error"
            loading={isUnlinking}
            variant="contained"
          >
            {t("userActions.adminUnlinkDialogConfirm")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
