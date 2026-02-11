import { Ship } from "../../datatypes/Ship"
import React from "react"
import { useTranslation } from "react-i18next" // Added for translations

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
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';

const statusColors = new Map<
  string,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
>()
statusColors.set("flight-ready", "success")
statusColors.set("in-repair", "warning")
statusColors.set("awaiting-repair", "error")
statusColors.set("in-concept", "info")

// Get images https://api.fleetyards.net/v1/models?perPage=240&page=1
export function ShipStatus(props: { ship: Ship; index: number }) {
  const { ship, index } = props
  const { t } = useTranslation() // Translation hook

  return (
    <Grid item xs={12} md={6} lg={4} xl={4}>
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            height: 400,
          }}
        >
          <CardHeader
            title={
              <Typography variant={"subtitle1"} color={"text.secondary"}>
                {/* Manufacturer + Name */}
                {ship.manufacturer} {ship.name}
              </Typography>
            }
            subheader={
              <Typography variant={"subtitle2"} color={"text.primary"}>
                {/* Size + Kind (kind translated) */}
                {ship.size} - {t(`ships.table.kind`)}
              </Typography>
            }
            sx={{
              padding: 2,
            }}
          />

          <CardMedia
            component="img"
            loading="lazy"
            image={ship.image}
            alt={ship.name}
            sx={{
              height: 200,
              // maxHeight: '100%',
              // maxHeight: 200,
              overflow: "hidden",
            }}
          />

          <CardContent>
            {/* Condition field */}
            <Typography variant={"body2"} fontWeight={"bold"}>
              {t("ships.table.condition")}:{" "}
              <Typography
                display={"inline"}
                color={statusColors.get(ship.condition) + ".main"}
                variant={"body2"}
                fontWeight={"bold"}
              >
                {t(`ships.condition.${ship.condition}`, {
                  defaultValue: ship.condition,
                })}
              </Typography>
            </Typography>
          </CardContent>
          <CardActions
            sx={{
              paddingLeft: 2,
              paddingRight: 2,
            }}
          >
            <Grid container justifyContent={"space-between"}>
              <Button color={"primary"}>{t("ships.report_condition")}</Button>
            </Grid>
          </CardActions>
        </Card>
      </Fade>
    </Grid>
  )
}
