import React from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { FlatSection } from "../../components/paper/Section"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BACKEND_URL, isCitizenIdEnabled } from "../../util/constants"
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { Discord } from "../../components/icon/DiscordIcon"
import { CitizenIDLogo } from "../../components/icon/CitizenIDLogo"
import { CitizenIDLoginButton } from "../../components/button/CitizenIDLoginButton"
import { LinkCitizenIDButton } from "../../components/button/LinkCitizenIDButton"
import { DiscordLoginButton } from "../../components/button/DiscordLoginButton"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import LoadingButton from "@mui/lab/LoadingButton"
import { useAccountLinks } from "../../features/profile/hooks/useAccountLinks"

export function AccountLinks() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const {
    isLoading, isUnlinking, isSettingPrimary,
    errorMessage, setErrorMessage,
    accountUsername, setAccountUsername,
    citizenIDUsername, setCitizenIDUsername,
    authProviders, hasDiscord, hasCitizenID, primaryProvider,
    unlinkDialog, handleUnlinkClick, handleConfirmUnlink, handleCancelUnlink,
    handleSetPrimary, getProviderName,
  } = useAccountLinks()

  const getProviderIcon = (providerType: string) => {
    switch (providerType) {
      case "discord": return <Discord />
      case "citizenid": return isCitizenIdEnabled ? <CitizenIDLogo height={24} /> : <AccountCircleIcon />
      default: return <AccountCircleIcon />
    }
  }
  return (
    <>
      <FlatSection
        title={t("settings.profile.accountLinks", "Linked Accounts")}
      >
        {errorMessage && (
          <Grid item xs={12}>
            <Alert
              severity="error"
              onClose={() => {
                setErrorMessage(null)
                setAccountUsername(null)
                setCitizenIDUsername(null)
              }}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" component="div">
                {errorMessage}
              </Typography>
              {accountUsername && citizenIDUsername && (
                <Box
                  sx={{
                    mt: 2,
                    pl: 2,
                    borderLeft: 2,
                    borderColor: "error.main",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: "medium" }}
                  >
                    {t("settings.profile.usernames", "Usernames:")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>
                      {t(
                        "settings.profile.accountUsername",
                        "Account username",
                      )}
                      :
                    </strong>{" "}
                    <code
                      style={{
                        backgroundColor: theme.palette.action.hover,
                        padding: "2px 4px",
                        borderRadius: `${theme.spacing(theme.borderRadius.input)}px`,
                      }}
                    >
                      {accountUsername}
                    </code>
                  </Typography>
                  <Typography variant="body2">
                    <strong>
                      {t(
                        "settings.profile.citizenIDUsername",
                        "Citizen iD username",
                      )}
                      :
                    </strong>{" "}
                    <code
                      style={{
                        backgroundColor: theme.palette.action.hover,
                        padding: "2px 4px",
                        borderRadius: `${theme.spacing(theme.borderRadius.input)}px`,
                      }}
                    >
                      {citizenIDUsername}
                    </code>
                  </Typography>
                </Box>
              )}
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "settings.profile.accountLinksDescription",
              "Manage your linked authentication accounts. You can link multiple accounts and choose which one to use for login.",
            )}
          </Typography>
        </Grid>

        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading...</Typography>
          </Grid>
        ) : (
          <>
            {authProviders.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {authProviders.map((link) => (
                    <Box
                      key={link.provider_type}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 2,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: theme.spacing(
                          theme.borderRadius.topLevel,
                        ),
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {getProviderIcon(link.provider_type)}
                        <Typography variant="body1">
                          {getProviderName(link.provider_type)}
                        </Typography>
                        {link.is_primary && (
                          <Chip
                            label={t("settings.profile.primary", "Primary")}
                            color="primary"
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {!link.is_primary && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleSetPrimary(link.provider_type)}
                            disabled={isSettingPrimary}
                          >
                            {t("settings.profile.setPrimary", "Set as Primary")}
                          </Button>
                        )}
                        {authProviders.length > 1 && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() =>
                              handleUnlinkClick(link.provider_type)
                            }
                            disabled={isUnlinking}
                          >
                            {t("settings.profile.unlink", "Unlink")}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {t("settings.profile.linkNewAccount", "Link New Account")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {!hasDiscord && <DiscordLoginButton />}
                {isCitizenIdEnabled && !hasCitizenID && <LinkCitizenIDButton />}
                {hasDiscord && (!isCitizenIdEnabled || hasCitizenID) && (
                  <Typography variant="body2" color="text.secondary">
                    {t(
                      "settings.profile.allAccountsLinked",
                      "All available accounts are linked.",
                    )}
                  </Typography>
                )}
              </Box>
            </Grid>
          </>
        )}
      </FlatSection>

      {/* On mobile, use BottomSheet */}
      {isMobile ? (
        <BottomSheet
          open={unlinkDialog.open}
          onClose={handleCancelUnlink}
          title={t("settings.profile.unlinkProviderTitle", "Unlink Account")}
          maxHeight="90vh"
        >
          <DialogContentText id="unlink-dialog-description">
            {t(
              "settings.profile.unlinkProviderDescription",
              "Are you sure you want to unlink this account? You will no longer be able to log in using this method.",
              {
                provider: unlinkDialog.providerType
                  ? getProviderName(unlinkDialog.providerType)
                  : "",
              },
            )}
          </DialogContentText>
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button onClick={handleCancelUnlink}>
              {t("common.cancel", "Cancel")}
            </Button>
            <LoadingButton
              onClick={handleConfirmUnlink}
              color="error"
              loading={isUnlinking}
              variant="contained"
            >
              {t("settings.profile.unlink", "Unlink")}
            </LoadingButton>
          </Box>
        </BottomSheet>
      ) : (
        <Dialog
          open={unlinkDialog.open}
          onClose={handleCancelUnlink}
          aria-labelledby="unlink-dialog-title"
          aria-describedby="unlink-dialog-description"
        >
          <DialogTitle id="unlink-dialog-title">
            {t("settings.profile.unlinkProviderTitle", "Unlink Account")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="unlink-dialog-description">
              {t(
                "settings.profile.unlinkProviderDescription",
                "Are you sure you want to unlink this account? You will no longer be able to log in using this method.",
                {
                  provider: unlinkDialog.providerType
                    ? getProviderName(unlinkDialog.providerType)
                    : "",
                },
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelUnlink}>
              {t("common.cancel", "Cancel")}
            </Button>
            <LoadingButton
              onClick={handleConfirmUnlink}
              color="error"
              loading={isUnlinking}
              variant="contained"
            >
              {t("settings.profile.unlink", "Unlink")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
