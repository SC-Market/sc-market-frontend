import { Section } from "../../components/paper/Section"
import React, { useState } from "react"
import { shipList, ShipName } from "../../datatypes/Ship"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useTranslation } from "react-i18next" // Translation hook

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';

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
          onChange={(event: any, newValue: ShipName | null) => {
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
