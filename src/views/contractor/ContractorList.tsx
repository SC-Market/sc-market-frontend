import React from "react"
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Fade,
  Grid,
  Link as MaterialLink,
  Skeleton,
  Typography,
} from "@mui/material"
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
import { InfoRounded, LocalHospitalRounded } from "@mui/icons-material"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { DiceD20 } from "mdi-material-ui"
import { useTranslation } from "react-i18next"

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

