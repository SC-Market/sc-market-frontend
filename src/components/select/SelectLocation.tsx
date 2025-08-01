import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { BACKEND_URL } from "../../util/constants"
import throttle from "lodash/throttle"
import { Autocomplete, Grid, TextField, Typography } from "@mui/material"
import { Section } from "../paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"

export function romanize(num: number) {
  if (isNaN(num)) return NaN
  let digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ],
    roman = "",
    i = 3
  while (i--) {
    const digit = digits.pop()
    if (digit == null) break
    roman = (key[+digit + i * 10] || "") + roman
  }
  return Array(+digits.join("") + 1).join("M") + roman
}

export interface StarmapObject {
  id: string
  code: string
  designation: string
  name: null | string
  star_system_id: string
  status: string
  type: string
  star_system: {
    id: string
    code: string
    name: null | string
    type: string
  }
}

export function SelectLocation() {
  const { t } = useTranslation()

  const [locationSuggest, setLocationSuggest] = useState<StarmapObject[]>([])
  const [locationTarget, setLocationTarget] = useState("")
  const [locationTargetObject, setLocationTargetObject] =
    useState<StarmapObject | null>(null)

  const getSuggestions = React.useCallback(async (query: string) => {
    if (query.length < 3) {
      return []
    }

    const resp = await fetch(
      `${BACKEND_URL}/api/starmap/search/${encodeURIComponent(query)}`,
      {
        method: "GET",
        credentials: "include",
      },
    )
    const data = await resp.json()

    const extended: StarmapObject[] = []

    await Promise.all(
      data.objects.resultset.map(async (obj: StarmapObject) => {
        if (obj.type === "SATELLITE") {
          const planetNum = obj.designation.replace(/\D/g, "")
          const planetDes = `${obj.star_system.name} ${romanize(
            parseInt(planetNum),
          )}`

          extended.push(...(await getSuggestions(planetDes)))
        }
      }),
    )
    extended.push(...data.objects.resultset)

    return extended
  }, [])

  const retrieveLocation = React.useMemo(
    () =>
      throttle(async (query: string) => {
        const suggestions = await getSuggestions(query)
        setLocationSuggest(suggestions)
      }, 400),
    [getSuggestions],
  )

  useEffect(() => {
    retrieveLocation(locationTarget)
  }, [locationTarget, retrieveLocation])

  return (
    <>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("selectLocation.title", "Location")}
          </Typography>
        </Grid>
        <Grid item xs={12} lg={8} container spacing={2}>
          <Grid item xs={12} lg={12}>
            <Autocomplete
              id="locationure-select"
              options={locationSuggest}
              getOptionLabel={(option: StarmapObject) => {
                console.log(option)
                if (option.type === "SATELLITE") {
                  const planetNum = option.designation.replace(/\D/g, "")
                  const planetDes = `${option.star_system.name} ${romanize(
                    parseInt(planetNum),
                  )}`
                  const planet = locationSuggest.find(
                    (obj) => obj.designation === planetDes,
                  )

                  return `${option.name || option.designation} - ${
                    planet ? planet.name : ""
                  } - ${option.star_system.name} (${option.designation})`
                } else if (option.type === "STAR") {
                  return `${option.name || option.designation} (${
                    option.designation
                  })`
                }

                return `${option.name || option.designation} - ${
                  option.star_system.name
                } (${option.designation})`
              }}
              value={locationTargetObject}
              onChange={(event: any, newValue: StarmapObject | null) => {
                setLocationTargetObject(newValue)
              }}
              inputValue={locationTarget}
              onInputChange={(event, newInputValue) => {
                setLocationTarget(newInputValue)
              }}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label={t("selectLocation.inputLabel", "Source (Optional)")}
                    color={"secondary"}
                    SelectProps={{
                      IconComponent: KeyboardArrowDownRoundedIcon,
                    }}
                    sx={{
                      "& .MuiSelect-icon": {
                        fill: "white",
                      },
                    }}
                    helperText={t(
                      "selectLocation.helperText",
                      "For Escort and Transport, for example, from where to where will the order occur? For Support, where should the contractor find you?",
                    )}
                  />
                )
              }}
            />
          </Grid>
        </Grid>
      </Section>
    </>
  )
}
