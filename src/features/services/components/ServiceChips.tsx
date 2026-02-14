import { useCallback } from "react"
import { Box, Chip, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import { ElectricBoltRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { orderIcons, Service } from "../../../datatypes/Order"
import { useServiceSearch } from "../../../hooks/contract/ServiceSearch"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function ServiceChips(props: { service: Service }) {
  const { service } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [, setSearchState] = useServiceSearch()
  const navigate = useNavigate()

  const handleKindClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setSearchState((prev) => ({ ...prev, kind: service.kind }))
      navigate("/order/services")
    },
    [service.kind, setSearchState, navigate],
  )

  const handleLanguageClick = useCallback(
    (langCode: string) => (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setSearchState((prev) => ({ ...prev, language_codes: [langCode] }))
      navigate("/order/services")
    },
    [setSearchState, navigate],
  )

  return (
    <Box sx={{ padding: 2, paddingTop: 0 }}>
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        flexWrap={"wrap"}
      >
        <Chip
          color={"primary"}
          label={t(`myServices.${service.kind}`, {
            defaultValue: service.kind,
          })}
          sx={{ marginBottom: 1, padding: 1 }}
          variant={"outlined"}
          icon={orderIcons[service.kind]}
          onClick={handleKindClick}
        />
        {service.rush && (
          <Chip
            color={"warning"}
            label={t("serviceListings.rush")}
            sx={{ marginBottom: 1, padding: 1 }}
            variant={"outlined"}
            icon={<ElectricBoltRounded />}
            onClick={(event) => event.stopPropagation()}
          />
        )}
        {service.languages && service.languages.length > 0 && (
          <>
            {service.languages.map((lang) => (
              <Chip
                key={lang.code}
                label={lang.name}
                variant="outlined"
                sx={{ marginBottom: 1, padding: 1 }}
                onClick={handleLanguageClick(lang.code)}
              />
            ))}
          </>
        )}
      </Stack>
    </Box>
  )
}
