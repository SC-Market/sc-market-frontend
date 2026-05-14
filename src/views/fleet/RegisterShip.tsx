import { Section } from "../../components/paper/Section"
import React, { useState } from "react"
import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material"
import { shipList, ShipName } from "../../datatypes/Ship"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useTranslation } from "react-i18next" // Translation hook

export function RegisterShip(props: {}) {
  const [ship, setShip] = useState<ShipName | null>(null)
  const { t } = useTranslation()

  return (
    <Section xs={12} lg={8} title={t("ships.register.title")} fill>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          id="jobs"
          options={shipList}
          filterSelectedOptions
          value={ship}
          getOptionLabel={(option) => option}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label={t("ships.register.ship_label")}
              fullWidth
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
              aria-describedby="ship-selection-help"
              inputProps={{
                ...params.inputProps,
                "aria-label": t(
                  "accessibility.selectShip",
                  "Select ship to register",
                ),
              }}
            />
          )}
          onChange={(_event: React.SyntheticEvent, newValue: ShipName | null) => {
            setShip(newValue)
          }}
          aria-label={t("accessibility.shipSelector", "Ship selector")}
          aria-describedby="ship-selection-help"
        />
        <div id="ship-selection-help" className="sr-only">
          {t(
            "accessibility.shipSelectionHelp",
            "Select the ship you want to register to your fleet",
          )}
        </div>
      </Grid>

      <Grid item xs={12} container justifyContent={"center"}>
        <Box>
          <Button
            color={"primary"}
            aria-label={t("accessibility.registerShip", "Register ship")}
            aria-describedby="register-ship-help"
          >
            {t("ships.register.submit")}
            <span id="register-ship-help" className="sr-only">
              {t(
                "accessibility.registerShipHelp",
                "Register the selected ship to your fleet",
              )}
            </span>
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}
