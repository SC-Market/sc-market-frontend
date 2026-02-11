import React from "react"
import { Contractor } from "../../datatypes/Contractor"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded"

import { Link } from "react-router-dom"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import LocalGasStationRoundedIcon from "@mui/icons-material/LocalGasStationRounded"
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded"
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded"
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded"
import FlightRoundedIcon from "@mui/icons-material/FlightRounded"
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded"
import SwordCrossIcon from "mdi-material-ui/SwordCross"
import TowTruckIcon from "mdi-material-ui/TowTruck"
import HydraulicOilTemperatureIcon from "mdi-material-ui/HydraulicOilTemperature"
import PublicRoundedIcon from "@mui/icons-material/PublicRounded"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { DiceD20 } from "mdi-material-ui"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export const contractorKindIcons = {
  freight: <LocalShippingRoundedIcon />,
  refuel: <LocalGasStationRoundedIcon />,
  repair: <HandymanRoundedIcon />,
  escort: <GppGoodRoundedIcon />,
  transport: <FlightRoundedIcon />,
  mining: <PublicRoundedIcon />,
  exploration: <ExploreRoundedIcon />,
  combat: <SwordCrossIcon />,
  salvage: <TowTruckIcon />,
  refining: <HydraulicOilTemperatureIcon />,
  construction: <ConstructionRoundedIcon />,
  social: <PeopleAltRoundedIcon />,
  roleplay: <DiceD20 />,
  medical: <LocalHospitalRounded />,
  intelligence: <InfoRounded />,
}

export type ContractorKindIconKey = keyof typeof contractorKindIcons
export const contractorKindIconsKeys: ContractorKindIconKey[] = Object.keys(
  contractorKindIcons,
) as ContractorKindIconKey[]

export const ContractorListItem = React.memo(
  function ContractorListItem(props: {
    contractor: Contractor
    index: number
  }) {
    const { contractor, index } = props
    const theme = useTheme<ExtendedTheme>()
    const { t } = useTranslation()

    return (
      <Grid item xs={12} lg={12}>
        <Link
          to={`/contractor/${contractor.spectrum_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Fade
            in={true}
            style={{
              transitionDelay: `${50 + 50 * index}ms`,
              transitionDuration: "500ms",
            }}
          >
            <CardActionArea
              sx={{
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <Card
                sx={{
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),

                  ...(theme.palette.mode === "dark"
                    ? {
                        background: `url(${contractor.banner})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                }}
              >
                <Box
                  sx={{
                    ...(theme.palette.mode === "dark"
                      ? {
                          background: `linear-gradient(to bottom, ${theme.palette.background.default}AA, ${theme.palette.background.default} 100%)`,
                        }
                      : {}),
                    height: "100%",
                    width: "100%",
                    padding: 1,
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar
                        src={
                          contractor.avatar ||
                          "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
                        }
                        aria-label={t("contractors.contractor")}
                        variant={"rounded"}
                        imgProps={{
                          onError: ({ currentTarget }) => {
                            currentTarget.onerror = null
                            currentTarget.src =
                              "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
                          },
                        }}
                        sx={{
                          maxHeight: theme.spacing(12),
                          maxWidth: theme.spacing(12),
                          // maxWidth:'100%',
                          // maxHeight:'100%',
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    }
                    title={
                      <MaterialLink
                        component={Link}
                        to={`/contractor/${contractor.spectrum_id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <UnderlineLink
                          color={"text.secondary"}
                          variant={"subtitle1"}
                          fontWeight={"bold"}
                        >
                          {contractor.name}
                        </UnderlineLink>
                      </MaterialLink>
                    }
                    subheader={
                      <Box>
                        <Grid
                          container
                          alignItems={"center"}
                          spacing={theme.layoutSpacing.compact}
                        >
                          <Grid item>
                            <PeopleAltRoundedIcon
                              style={{ color: theme.palette.text.primary }}
                            />
                          </Grid>
                          <Grid item>
                            <Typography
                              sx={{ marginLeft: 1 }}
                              color={"text.primary"}
                              fontWeight={"bold"}
                            >
                              {contractor.size}
                            </Typography>
                          </Grid>
                        </Grid>

                        <ListingSellerRating contractor={contractor} />
                      </Box>
                    }
                    // action={
                    //     <Button color={'secondary'} variant={'outlined'}>
                    //         Contact
                    //     </Button>
                    // }
                  />
                  <CardContent>
                    {
                      // @ts-ignore
                      <Typography
                        sx={{
                          "-webkit-box-orient": "vertical",
                          display: "-webkit-box",
                          "-webkit-line-clamp": "3",
                          overflow: "hidden",
                          lineClamp: "4",
                          textOverflow: "ellipsis",
                          // whiteSpace: "pre-line"
                        }}
                        variant={"body2"}
                      >
                        <MarkdownRender text={contractor.description} />
                      </Typography>
                    }
                  </CardContent>
                  <CardActions>
                    <Box>
                      {contractor.fields.map((field) => (
                        <Chip
                          key={field}
                          color={"primary"}
                          label={t(`contractorList.fields.${field}`, field)}
                          sx={{
                            marginRight: 1,
                            marginBottom: 1,
                            padding: 1,
                            textTransform: "capitalize",
                          }}
                          variant={"outlined"}
                          icon={contractorKindIcons[field]}
                          onClick={
                            (event) => event.stopPropagation() // Don't highlight cell if button clicked
                          }
                        />
                      ))}
                    </Box>
                  </CardActions>
                </Box>
              </Card>
            </CardActionArea>
          </Fade>
        </Link>
      </Grid>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if contractor data actually changed
    return (
      prevProps.contractor.spectrum_id === nextProps.contractor.spectrum_id &&
      prevProps.index === nextProps.index
    )
  },
)
