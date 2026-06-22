import { Section } from "../../components/paper/Section"
import React from "react"
import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { PersonRemoveRounded, PersonRounded } from "@mui/icons-material"
import { Order } from "../../features/orders/domain/types"
import { useTranslation } from "react-i18next"
import { useMemberAssign } from "../../features/orders/hooks/useMemberAssign"

export function MemberAssignArea(props: { order: Order }) {
  const { order } = props
  const { t } = useTranslation()
  const {
    target,
    setTarget,
    targetObject,
    setTargetObject,
    options,
    members,
    updateAssignment,
    removeAssignment,
  } = useMemberAssign(order.order_id, order.contractor || undefined)

  return (
    <Section
      xs={12}
      md={6}
      lg={4}
      title={
        order.assigned_to
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
