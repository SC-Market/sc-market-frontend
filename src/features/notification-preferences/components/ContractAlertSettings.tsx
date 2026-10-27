import React from "react"
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { FlatSection } from "../../../components/paper/Section"
import {
  useGetContractAlertsQuery,
  useUpdateContractAlertMutation,
  type ContractKind,
} from "../../../store/api/v2/market"

/**
 * Opt-in alert for new public contracts: in-app and push, personally or for
 * each org, optionally only for some kinds. Off until turned on.
 */
export function ContractAlertSettings() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetContractAlertsQuery()
  const [update, { isLoading: isSaving, isError: saveFailed }] =
    useUpdateContractAlertMutation()

  const save = (
    contractor_id: string | null,
    enabled: boolean,
    kinds: ContractKind[] | null,
  ) => update({ updateContractAlertRequest: { contractor_id, enabled, kinds } })

  return (
    <FlatSection
      title={t("settings.contractAlerts.title", "New public contract alerts")}
    >
      <Box sx={{ width: "100%" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            "settings.contractAlerts.description",
            "Get an in-app and push notification when someone posts a public contract. Off by default. Leave every kind unticked to hear about all of them.",
          )}
        </Typography>
        {(isError || saveFailed) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t(
              "settings.contractAlerts.error",
              "Couldn't load or save your contract alerts.",
            )}
          </Alert>
        )}
        {isLoading || !data
          ? !isError && <CircularProgress />
          : data.scopes.map((scope) => {
              const sub = data.subscriptions.find(
                (s) =>
                  (s.contractor_id ?? null) === (scope.contractor_id ?? null),
              )
              const name = scope.contractor_id
                ? scope.name
                : t("settings.notifications.personal", "Personal")
              const kinds = sub?.kinds ?? null
              const toggleKind = (k: ContractKind) => {
                const current = kinds ?? []
                const next = current.includes(k)
                  ? current.filter((x) => x !== k)
                  : [...current, k]
                save(
                  scope.contractor_id ?? null,
                  true,
                  next.length ? next : null,
                )
              }
              return (
                <Box key={scope.contractor_id ?? "personal"} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!sub}
                        disabled={isSaving}
                        onChange={(e) =>
                          save(
                            scope.contractor_id ?? null,
                            e.target.checked,
                            kinds,
                          )
                        }
                        inputProps={{
                          "aria-label": `${t("settings.contractAlerts.toggle", "Contract alerts for")} ${name}`,
                        }}
                      />
                    }
                    label={name}
                  />
                  {sub && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        ml: 1,
                      }}
                    >
                      {data.kinds.map((k) => (
                        <Chip
                          key={k}
                          size="small"
                          label={t(`orderKinds.${k}`, k)}
                          color={kinds?.includes(k) ? "primary" : "default"}
                          variant={kinds?.includes(k) ? "filled" : "outlined"}
                          onClick={() => toggleKind(k)}
                          disabled={isSaving}
                          icon={
                            <Checkbox
                              size="small"
                              checked={!!kinds?.includes(k)}
                              sx={{ p: 0 }}
                              tabIndex={-1}
                              inputProps={{
                                "aria-label": t(`orderKinds.${k}`, k),
                              }}
                            />
                          }
                          aria-pressed={!!kinds?.includes(k)}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )
            })}
      </Box>
    </FlatSection>
  )
}
