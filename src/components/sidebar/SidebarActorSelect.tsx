import React, { useEffect, useState } from "react"
import {
  Avatar,
  Box,
  createTheme,
  MenuItem,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import { useCookies } from "react-cookie"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"

const localTheme = createTheme({
  palette: {
    mode: "dark",
  },
})

export function SidebarActorSelect() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()

  const [cookies, setCookie, deleteCookie] = useCookies(["current_contractor"])
  const [contractorSpectrumID, setContractorSpectrumID] = useState(
    cookies.current_contractor || "_",
  )

  const contractor = useGetContractorBySpectrumIDQuery(contractorSpectrumID!, {
    skip: !contractorSpectrumID || contractorSpectrumID === "_",
  })

  const [, setCurrentOrg] = useCurrentOrg()

  useEffect(() => {
    if (!profile) {
      return
    }

    const isMember = profile.contractors.some(
      (choice) => choice.spectrum_id === contractorSpectrumID,
    )

    if (!contractorSpectrumID || contractorSpectrumID === "_" || !isMember) {
      if (contractorSpectrumID !== "_") {
        setContractorSpectrumID("_")
      }
      setCurrentOrg(null)
      deleteCookie("current_contractor")
      return
    }

    if (contractor.error) {
      setContractorSpectrumID("_")
      setCurrentOrg(null)
      deleteCookie("current_contractor")
      return
    }

    if (contractor.data) {
      // If the contractor is archived, reset to personal profile
      if (contractor.data.archived) {
        setContractorSpectrumID("_")
        setCurrentOrg(null)
        deleteCookie("current_contractor")
        return
      }

      setCurrentOrg(contractor.data)
      setCookie("current_contractor", contractorSpectrumID, {
        path: "/",
        sameSite: "strict",
      })
    }
  }, [
    contractor.data,
    contractor.error,
    contractorSpectrumID,
    deleteCookie,
    profile,
    setContractorSpectrumID,
    setCurrentOrg,
    setCookie,
  ])

  const theme = useTheme<ExtendedTheme>()

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.background.sidebar,
        boxShadow: "none",
      }}
    >
      <ThemeProvider theme={localTheme}>
        <TextField
          select
          fullWidth
          value={contractorSpectrumID}
          onChange={(event: React.ChangeEvent<{ value: string }>) => {
            setContractorSpectrumID(event.target.value)
          }}
          SelectProps={{
            IconComponent: KeyboardArrowDownRoundedIcon,
            MenuProps: {
              PaperProps: {
                sx: {
                  bgcolor: theme.palette.background.sidebar,
                  "& .MuiMenuItem-root": {
                    color: theme.palette.getContrastText(theme.palette.background.sidebar),
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  },
                },
                variant: "outlined",
                padding: 2,
              },
            },
          }}
          sx={{ 
            borderRadius: 32,
            "& .MuiInputLabel-root": {
              color: theme.palette.getContrastText(theme.palette.background.sidebar),
            },
            "& .MuiOutlinedInput-root": {
              color: theme.palette.getContrastText(theme.palette.background.sidebar),
              "& fieldset": {
                borderColor: theme.palette.getContrastText(theme.palette.background.sidebar),
                opacity: 0.3,
              },
              "&:hover fieldset": {
                borderColor: theme.palette.getContrastText(theme.palette.background.sidebar),
                opacity: 0.5,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.getContrastText(theme.palette.background.sidebar),
                opacity: 0.7,
              },
            },
          }}
          label={t("sidebar_actor_select.select_role")}
        >
          {profile ? (
            [
              <MenuItem value={"_"} key={"user"}>
                <Stack
                  direction={"row"}
                  spacing={theme.layoutSpacing.compact}
                  alignItems={"center"}
                  justifyContent={"left"}
                >
                  <Avatar
                    variant={"rounded"}
                    src={profile?.avatar}
                    alt={t("sidebar_actor_select.avatar_of", {
                      username: profile.username,
                    })}
                    sx={{ height: 48, width: 48 }}
                  />
                  <Box>
                    <Typography color={theme.palette.getContrastText(theme.palette.background.sidebar)}>
                      {profile.display_name}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>,
              ...profile.contractors.map((choice) => (
                <MenuItem value={choice.spectrum_id} key={choice.spectrum_id}>
                  <Stack
                    direction={"row"}
                    spacing={theme.layoutSpacing.compact}
                    alignItems={"center"}
                    justifyContent={"left"}
                    maxWidth={"100%"}
                    sx={{ whiteSpace: "normal" }}
                  >
                    <Avatar
                      variant={"rounded"}
                      src={choice?.avatar}
                      alt={t("sidebar_actor_select.avatar_of", {
                        username: choice.avatar,
                      })}
                      sx={{ height: 48, width: 48 }}
                    />
                    <Typography 
                      style={{ whiteSpace: "normal" }}
                      color={theme.palette.getContrastText(theme.palette.background.sidebar)}
                    >
                      {choice.name}
                    </Typography>
                  </Stack>
                </MenuItem>
              )),
            ]
          ) : (
            <MenuItem value={contractorSpectrumID}>
              <Typography color={theme.palette.getContrastText(theme.palette.background.sidebar)}>
                {t("sidebar_actor_select.login_to_select_role")}
              </Typography>
            </MenuItem>
          )}
        </TextField>
      </ThemeProvider>
    </Paper>
  )
}
