import {
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { orderIcons } from "../../datatypes/Order"
import React, { useEffect, useState } from "react"
import { useServiceSearch } from "../../hooks/contract/ServiceSearch"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next" // added localisation

export function ServiceSearchArea() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()

  // Search fields
  const [kind, setKind] = useState<string>("Any")
  const [minOffer, setMinOffer] = useState<number>(0)
  const [maxOffer, setMaxOffer] = useState<number | null>(null)
  const [query, setQuery] = useState<string>("")
  const [paymentType, setPaymentType] = useState<string>("any")
  const [, setSearchState] = useServiceSearch()

  const handleKindChange = (event: { target: { value: string } }) => {
    setKind(event.target.value)
  }
  const handleMinCostChange = (event: { target: { value: string } }) => {
    setMinOffer(+event.target.value || 0)
  }
  const handleMaxCostChange = (event: { target: { value: string } }) => {
    setMaxOffer(event.target.value ? +event.target.value || null : null)
  }
  const handleQueryChange = (event: { target: { value: string } }) => {
    setQuery(event.target.value)
  }

  const handlePaymentTypeChange = (event: { target: { value: string } }) => {
    setPaymentType(event.target.value)
  }

  useEffect(() => {
    setSearchState((state) => ({
      ...state,
      kind: kind === "Any" ? undefined : kind,
      minOffer: minOffer,
      maxOffer: maxOffer,
      query: query,
      paymentType: paymentType === "any" ? undefined : paymentType,
    }))
  }, [kind, setSearchState, query, minOffer, maxOffer, paymentType])

  return (
    <Stack
      direction={"column"}
      sx={{
        padding: theme.spacing(3),
        paddingTop: theme.spacing(3),
        borderColor: theme.palette.outline.main,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("service_search.search")}
            InputProps={{
              startAdornment: <SearchIcon style={{ color: "inherit" }} />,
            }}
            value={query}
            onChange={handleQueryChange}
            color={"secondary"}
            size={"small"}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("service_search.filtering")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            value={kind}
            label={t("service_search.contract_type")}
            onChange={handleKindChange}
            size={"small"}
            color={"secondary"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            {["Any", ...Object.keys(orderIcons)].map((k) => (
              <MenuItem value={k} key={k}>
                {t(`service_search.contract_types.${k}`, k)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("service_search.cost")}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            value={minOffer}
            label={t("service_search.min_cost")}
            onChange={handleMinCostChange}
            size={"small"}
            color={"secondary"}
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
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={maxOffer == null ? "" : maxOffer}
            label={t("service_search.max_cost")}
            onChange={handleMaxCostChange}
            size={"small"}
            color={"secondary"}
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
        <Grid item xs={12}>
          <TextField
            select
            label={t("service_search.payment_type")}
            value={paymentType}
            size={"small"}
            onChange={handlePaymentTypeChange}
            fullWidth
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={"any"}>
              {t("service_search.payment_types.any")}
            </MenuItem>
            <MenuItem value={"one-time"}>
              {t("service_search.payment_types.one_time")}
            </MenuItem>
            <MenuItem value={"hourly"}>
              {t("service_search.payment_types.hourly")}
            </MenuItem>
            <MenuItem value={"daily"}>
              {t("service_search.payment_types.daily")}
            </MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Stack>
  )
}
