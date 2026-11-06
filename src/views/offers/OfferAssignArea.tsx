import { Section } from "../../components/paper/Section"
import React, { useCallback, useEffect, useState } from "react"
import { MinimalUser } from "../../datatypes/User"
import { useGetContractorMembersQuery } from "../../features/contractor/api/contractorApi"
import throttle from "lodash/throttle"
import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { contractorsApi } from "../../features/contractor/api/contractorApi"
import { useAppDispatch } from "../../store/hooks"
import { PersonRemoveRounded, PersonRounded } from "@mui/icons-material"
import { OfferSession } from "../../features/offers/api/offerApi"
import { useTranslation } from "react-i18next"
import { useOfferAssignment } from "../../features/offers/hooks/useOfferActions"

export function OfferAssignArea(props: { offer: OfferSession }) {
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{
    username: string
    display_name: string
  } | null>(null)
  const { offer } = props
  const contractorSpectrumId = offer.contractor?.spectrum_id
  const [options, setOptions] = useState<MinimalUser[]>([])

  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: contractorSpectrumId || "",
    page: 0,
    page_size: 100,
    search: "",
    role_filter: "",
    sort: "username",
  })

  const members = membersData?.members || []

  const fetchOptions = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        return
      }

      const { data } = await dispatch(
        contractorsApi.endpoints.searchContractorMembers.initiate({
          spectrum_id: contractorSpectrumId!,
          query: query,
        }),
      )

      setOptions(data || [])
    },
    [contractorSpectrumId, dispatch],
  )

  const retrieve = React.useMemo(
    () =>
      throttle((query: string) => {
        fetchOptions(query)
      }, 400),
    [fetchOptions],
  )

  useEffect(() => {
    retrieve(target)
  }, [target, retrieve])

  const { assign, unassign: removeAssignment } = useOfferAssignment(offer.id)

  const updateAssignment = useCallback(async () => {
    if (!targetObject) return
    await assign(targetObject.username)
  }, [assign, targetObject])

  return (
    <Section
      xs={12}
      title={
        offer.assigned_to
          ? t("memberAssignArea.reassign")
          : t("memberAssignArea.assign")
      }
    >
      <Grid item xs={12}>
        <Autocomplete
          filterOptions={(x) => x}
          fullWidth
          options={
            target
              ? options
              : members
                  .map((u) => ({
                    username: u.username,
                    display_name: u.username,
                  }))
                  .slice(0, 8)
          }
          getOptionLabel={(option) =>
            `${option.username} (${option.display_name})`
          }
          disablePortal
          color={targetObject ? "success" : "primary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("memberAssignArea.handle")}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            />
          )}
          value={targetObject}
          onChange={(
            _event: React.SyntheticEvent,
            newValue: { display_name: string; username: string } | null,
          ) => {
            setTargetObject(newValue)
          }}
          inputValue={target}
          onInputChange={(event, newInputValue) => {
            setTarget(newInputValue)
          }}
        />
      </Grid>
      <Grid item>
        <Box
          display={"flex"}
          alignItems={"flex-end"}
          justifyContent={"flex-end"}
          sx={{ width: "100%" }}
        >
          <Button
            variant={"contained"}
            color={"error"}
            onClick={removeAssignment}
            startIcon={<PersonRemoveRounded />}
          >
            {t("memberAssignArea.unassign")}
          </Button>
        </Box>
      </Grid>
      <Grid item>
        <Box
          display={"flex"}
          alignItems={"flex-end"}
          justifyContent={"flex-end"}
          sx={{ width: "100%" }}
        >
          <Button
            variant={"contained"}
            color={"secondary"}
            onClick={updateAssignment}
            startIcon={<PersonRounded />}
          >
            {t("memberAssignArea.assign")}
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}
