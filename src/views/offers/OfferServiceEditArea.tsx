import { OfferSession } from "../../store/offer"
import React, { useMemo } from "react"
import { ServiceListingBase } from "../contracts/ServiceListings"
import { Stack } from "@mui/system"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
} from "../../store/services"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Announcement from '@mui/icons-material/Announcement';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HourglassTop from '@mui/icons-material/HourglassTop';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';

export function OfferServiceEditArea(props: { offer: OfferSession }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { offer: session } = props
  const [body, setBody] = useCounterOffer()

  const { data: userServices } = useGetServicesQuery(
    session.assigned_to?.username!,
    {
      skip: !session.assigned_to?.username,
    },
  )
  const { data: contractorServices } = useGetServicesContractorQuery(
    session.contractor?.spectrum_id!,
    { skip: !session.contractor?.spectrum_id },
  )
  const services = useMemo(
    () => (session.assigned_to ? userServices : contractorServices) || [],
    [session.assigned_to, contractorServices, userServices],
  )

  const service = useMemo(() => {
    return services.find((t) => t.service_id === body.service_id) || null
  }, [body, services])

  return (
    <Grid item xs={12} lg={4} md={12}>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={theme.layoutSpacing.compact}>
          <Typography
            variant={"h5"}
            sx={{ fontWeight: "bold" }}
            color={"text.secondary"}
          >
            {t("OfferServiceEditArea.associatedServices")}
          </Typography>
          <TextField
            fullWidth
            select
            label={t("OfferServiceEditArea.selectServiceOptional")}
            id="order-service"
            value={service?.service_name || ""}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              if (event.target.value === "") {
                setBody({ ...body, service_id: null })
              } else {
                setBody({
                  ...body,
                  service_id: (services || []).find(
                    (t) => t.service_name === event.target.value,
                  )!.service_id,
                })
              }
            }}
            color={"secondary"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={""}>
              {t("OfferServiceEditArea.noService")}
            </MenuItem>
            {(services || []).map((t) => (
              <MenuItem value={t.service_name} key={t.service_name}>
                {t.service_name}
              </MenuItem>
            ))}
          </TextField>

          {service && <ServiceListingBase service={service} index={0} />}
        </Stack>
      </Paper>
    </Grid>
  )
}
