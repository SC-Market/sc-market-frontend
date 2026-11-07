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
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
} from "../../features/services/api/servicesApi"
import { useFormatters } from "../../util/format"

export function ServiceSellerOtherServices(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
  currentServiceId: string
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { userSeller, contractorSeller, currentServiceId } = props

  // Get other services from the same seller
  const { data: userServices, isLoading: userServicesLoading } =
    useGetServicesQuery(userSeller?.username || "", {
      skip: !userSeller?.username,
    })

  const { data: contractorServices, isLoading: contractorServicesLoading } =
    useGetServicesContractorQuery(contractorSeller?.spectrum_id || "", {
      skip: !contractorSeller?.spectrum_id,
    })

  const otherServices = useMemo(() => {
    const allServices = userServices || contractorServices || []
    return allServices
      .filter((s) => s.service_id !== currentServiceId) // Exclude current service
      .slice(0, 6) // Show max 6 other services
  }, [userServices, contractorServices, currentServiceId])

  const isLoading = userServicesLoading || contractorServicesLoading
  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""

  // Don't show section if no seller info, still loading, or no other services
  if (!sellerName || isLoading || !otherServices.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("serviceView.otherServicesFrom", {
            seller: sellerName,
            defaultValue: `Other services from ${sellerName}`,
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
            {otherServices.map((service) => (
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
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt.number(service.cost)} aUEC
                        </Typography>
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
