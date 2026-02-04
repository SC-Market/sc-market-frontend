import { Section } from "../../components/paper/Section"
import React, { useCallback, useEffect, useState } from "react"
import { MinimalUser } from "../../datatypes/User"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetContractorMembersQuery } from "../../store/contractor"
import throttle from "lodash/throttle"
import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { contractorsApi } from "../../store/contractor"
import { store } from "../../store/store"
import { PersonRemoveRounded, PersonRounded } from "@mui/icons-material"
import {
  useAssignOfferMutation,
  useUnassignOfferMutation,
  OfferSession,
} from "../../store/offer"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export function OfferAssignArea(props: { offer: OfferSession }) {
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{
    username: string
    display_name: string
  } | null>(null)
  const [currentOrg] = useCurrentOrg()
  const { offer } = props
  const [options, setOptions] = useState<MinimalUser[]>([])

  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: currentOrg?.spectrum_id || "",
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

      const { status, data, error } = await store.dispatch(
        contractorsApi.endpoints.searchContractorMembers.initiate({
          spectrum_id: currentOrg?.spectrum_id!,
          query: query,
        }),
      )

      setOptions(data || [])
    },
    [currentOrg?.spectrum_id],
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

  const [assignUser] = useAssignOfferMutation()
  const [unassignUser] = useUnassignOfferMutation()

  const updateAssignment = useCallback(async () => {
    if (!targetObject) {
      return
    }

    const res: { data?: any; error?: any } = await assignUser({
      session_id: offer.id,
      user_id: targetObject.username!,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("memberAssignArea.assigned"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("memberAssignArea.failed_assign")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [assignUser, offer.id, issueAlert, targetObject, t])

  const removeAssignment = useCallback(async () => {
    const res: { data?: any; error?: any } = await unassignUser({
      session_id: offer.id,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("memberAssignArea.unassigned"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("memberAssignArea.failed_unassign")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [unassignUser, offer.id, issueAlert, t])

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
            event: any,
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
