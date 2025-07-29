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
    if (profile) {
      if (
        contractorSpectrumID &&
        contractorSpectrumID !== "_" &&
        contractor.data
      ) {
        setCurrentOrg(contractor.data)
        setCookie("current_contractor", contractorSpectrumID, {
          path: "/",
          sameSite: "strict",
        })
      } else {
        setCurrentOrg(null)
        deleteCookie("current_contractor")
      }
    }

    if (contractor.error) {
      deleteCookie("current_contractor")
    }
  }, [
    contractor,
    deleteCookie,
    profile,
    setCurrentOrg,
    setCookie,
    contractorSpectrumID,
  ])

  const theme = useTheme()

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
                },
                variant: "outlined",
                padding: 2,
              },
            },
          }}
          sx={{ borderRadius: 32 }}
          label={t("sidebar_actor_select.select_role")}
        >
          {profile ? (
            [
              <MenuItem value={"_"} key={"user"}>
                <Stack
                  direction={"row"}
                  spacing={1}
                  alignItems={"center"}
                  justifyContent={"left"}
                >
                  <Avatar
                    variant={"rounded"}
                    src={profile?.avatar}
                    alt={t("sidebar_actor_select.avatar_of", { username: profile.username })}
                    sx={{ height: 48, width: 48 }}
                  />
                  <Box>{profile.display_name}</Box>
                </Stack>
              </MenuItem>,
              ...profile.contractors.map((choice) => (
                <MenuItem value={choice.spectrum_id} key={choice.spectrum_id}>
                  <Stack
                    direction={"row"}
                    spacing={1}
                    alignItems={"center"}
                    justifyContent={"left"}
                    maxWidth={"100%"}
                    sx={{ whiteSpace: "normal" }}
                  >
                    <Avatar
                      variant={"rounded"}
                      src={choice?.avatar}
                      alt={t("sidebar_actor_select.avatar_of", { username: choice.avatar })}
                      sx={{ height: 48, width: 48 }}
                    />
                    <Typography style={{ whiteSpace: "normal" }}>
                      {choice.name}
                    </Typography>
                  </Stack>
                </MenuItem>
              )),
            ]
          ) : (
            <MenuItem value={contractorSpectrumID}>
              {t("sidebar_actor_select.login_to_select_role")}
            </MenuItem>
          )}
        </TextField>
      </ThemeProvider>
    </Paper>
  )
}
