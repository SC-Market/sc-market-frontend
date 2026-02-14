import React from "react"
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Fade,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { Stack } from "@mui/system"
import { Service } from "../../../datatypes/Order"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { dateDiffInDays } from "../../../util/dateDiff"
import { ListingNameAndRating } from "../../../components/rating/ListingRating"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { PAYMENT_TYPE_MAP } from "../../../util/constants"
import { formatServiceUrl } from "../../../util/urls"
import { ServiceChips } from "./ServiceChips"

export const ServiceListingBase = React.memo(
  function ServiceListingBase(props: { service: Service; index: number }) {
    const { service, index } = props
    const { t } = useTranslation()
    const theme = useTheme<ExtendedTheme>()
    const key = PAYMENT_TYPE_MAP.get(service.payment_type) || ""

    return (
      <Link
        to={formatServiceUrl(service)}
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
              }}
            >
              <CardHeader
                disableTypography
                sx={{
                  overflow: "hidden",
                  root: {
                    overflow: "hidden",
                  },
                  content: {
                    overflow: "hidden",
                    width: "100%",
                    display: "contents",
                    flex: "1 1 auto",
                  },
                  "& .MuiCardHeader-content": {
                    overflow: "hidden",
                  },
                  paddingBottom: 1,
                }}
                title={
                  <Box display={"flex"} alignItems={"center"}>
                    {dateDiffInDays(new Date(), new Date(service.timestamp)) <=
                      1 && (
                      <Chip
                        color={"secondary"}
                        label={t("serviceListings.new")}
                        sx={{
                          marginRight: 1,
                          textTransform: "uppercase",
                          fontSize: "0.85em",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                    <Typography
                      noWrap
                      sx={{ marginRight: 1 }}
                      variant={"h6"}
                      color={"text.secondary"}
                    >
                      {service.service_name}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Box>
                    <ListingNameAndRating
                      user={service.user}
                      contractor={service.contractor}
                    />
                    <Typography color={"primary"} variant={"subtitle2"}>
                      {service.cost.toLocaleString(undefined)} aUEC{" "}
                      {key ? t(key) : ""}
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ padding: 2, paddingTop: 0 }}>
                <Stack
                  spacing={theme.layoutSpacing.text}
                  direction={"row"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    variant={"body2"}
                    component="div"
                    color={"text.secondary"}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: "6",
                      lineClamp: "6",
                      WebkitBoxOrient: "vertical",
                      overflowY: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <MarkdownRender
                      text={service.service_description}
                      plainText
                    />
                  </Typography>
                  {service.photos[0] ? (
                    <Avatar
                      src={
                        service.photos[0] ||
                        "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
                      }
                      variant={"rounded"}
                      sx={{ height: 128 + 32, width: 128 + 32 }}
                    />
                  ) : (
                    <Box sx={{ height: 128 + 32 }} />
                  )}
                </Stack>
              </CardContent>
              <ServiceChips service={service} />
            </Card>
          </CardActionArea>
        </Fade>
      </Link>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.service.service_id === nextProps.service.service_id &&
      prevProps.service.cost === nextProps.service.cost &&
      prevProps.service.status === nextProps.service.status &&
      prevProps.index === nextProps.index
    )
  },
)
