import { useMemo } from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  ButtonBase,
} from "@mui/material"
import { Link } from "react-router-dom"
import { ORDER_PATHS } from "../../routes/paths"
import { useTranslation } from "react-i18next"
import { useGetPublicServicesQuery } from "../../features/services/api/servicesApi"
import { useFormatters } from "../../util/format"

export function RelatedServicesByCategory(props: {
  serviceKind: string
  currentServiceId: string
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { serviceKind, currentServiceId } = props

  // Get services filtered by kind for related services
  const { data: servicesResponse, isLoading } = useGetPublicServicesQuery({
    kind: serviceKind,
    pageSize: 20, // Get more to filter out current service
  })

  const relatedServices = useMemo(() => {
    if (!servicesResponse?.data) return []

    return servicesResponse.data
      .filter((s) => s.service_id !== currentServiceId)
      .slice(0, 6) // Show max 6 related services
  }, [servicesResponse?.data, currentServiceId])

  // Don't show section if no related services or still loading
  if (isLoading || !relatedServices.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("serviceView.relatedServices", {
            category: serviceKind,
            defaultValue: `Related ${serviceKind} services`,
          })}
        </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            overflowX: "scroll",
            pb: 1,
          }}
        >
          <Box display={"flex"} gap={2}>
            {relatedServices.map((service) => (
              <Box
                key={service.service_id}
                sx={{
                  minWidth: 280,
                  maxWidth: 320,
                  flexShrink: 0,
                }}
              >
                <ButtonBase
                  component={Link}
                  to={ORDER_PATHS.service(service.service_id)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: (theme) =>
                      theme.spacing(theme.borderRadius.button),
                    textAlign: "left",
                  }}
                >
                  <Card
                    sx={{
                      height: 200, // Fixed height for consistent appearance
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardHeader
                      sx={{ pb: 1 }}
                      title={
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            wordBreak: "break-word",
                          }}
                        >
                          {service.service_name}
                        </Typography>
                      }
                      subheader={
                        <Box>
                          <Typography variant="body2" color="primary">
                            {fmt.number(service.cost)} aUEC
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              wordBreak: "break-word",
                            }}
                          >
                            {t("contractsUi.byName", {
                              name:
                                service.user?.display_name ||
                                service.contractor?.name,
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                    <CardContent
                      sx={{ pt: 0, pb: 2, flexGrow: 1, overflow: "hidden" }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          wordBreak: "break-word",
                          lineHeight: 1.4,
                        }}
                      >
                        {service.service_description}
                      </Typography>
                    </CardContent>
                  </Card>
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}
