import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Avatar,
  Button,
  Chip,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material"
import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import throttle from "lodash/throttle"
import { useSearchUsersQuery } from "../../features/profile/api/profileApi"
import { MinimalUser } from "../../datatypes/User"
import { useInviteOrgMembers } from "../../features/contractor/hooks/useOrgInviteActions"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

export function OrgInvite() {
  const [currentOrg] = useCurrentOrg()
  const [query, setQuery] = useState("")
  const [buffer, setBuffer] = useState("")
  const [message, setMessage] = useState("")
  const { t } = useTranslation()

  const { data: users } = useSearchUsersQuery(query, { skip: !query })

  const retrieve = React.useMemo(
    () =>
      throttle((query: string) => {
        if (query.length > 2) {
          setQuery(query)
        }
      }, 400),
    [setQuery],
  )

  const [choices, setChoices] = useState<MinimalUser[]>([])

  const inviteMembers = useInviteOrgMembers(currentOrg?.spectrum_id)

  const submitInviteForm = useCallback(async () => {
    const usernames = choices.map((u) => u.username)
    if (await inviteMembers(usernames, message)) {
      setChoices([])
      setBuffer("")
    }
    return false
  }, [choices, message, inviteMembers])

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("orgInvite.invite_members")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          fullWidth
          multiple
          filterSelectedOptions
          options={users || []}
          getOptionLabel={(u) => u.username}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField
              {...params}
              variant="outlined"
              label={t("orgInvite.username")}
              fullWidth
              color={"secondary"}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            />
          )}
          renderTags={(
            value: readonly MinimalUser[] | undefined,
            getTagProps,
          ) =>
            (value || []).map((option, index) => (
              <Chip
                color={"secondary"}
                label={option.username}
                sx={{ marginRight: 1 }}
                variant={"outlined"}
                avatar={<Avatar alt={option.username} src={option.avatar} />}
                {...getTagProps({ index })}
                key={option.username}
              />
            ))
          }
          value={choices}
          onChange={(_event: React.SyntheticEvent, newValue) => {
            setChoices(newValue || [])
          }}
          inputValue={buffer}
          onInputChange={(event, newInputValue) => {
            setBuffer(newInputValue)
            retrieve(newInputValue)
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          id="order-type"
          multiline
          maxRows={5}
          minRows={5}
          color={"secondary"}
          label={t("orgInvite.note")}
          value={message}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setMessage(event.target.value)
          }}
        ></TextField>
      </Grid>

      <Grid item container justifyContent={"center"}>
        <Button
          variant={"outlined"}
          color={"primary"}
          onClick={submitInviteForm}
          disabled={!choices.length}
        >
          {t("orgInvite.submit")}
        </Button>
      </Grid>
    </Section>
  )
}
