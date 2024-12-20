import { Section } from "../../components/paper/Section"
import { Button, Divider, Grid, Typography } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"

export function OrgBalance() {
  const [contractor] = useCurrentOrg()

  return (
    <Section>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          Org Balance
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"h4"}
          align={"left"}
          color={"primary"}
          sx={{ fontWeight: "bold", transition: "0.3s" }}
        >
          {contractor &&
            contractor?.balance &&
            contractor?.balance.toLocaleString("en-US")}{" "}
          aUEC
        </Typography>
      </Grid>
      <Grid item xs={12} container justifyContent={"space-between"}>
        <Link
          to={`/org/send`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Button color={"primary"} variant={"outlined"}>
            Send aUEC
          </Button>
        </Link>
        <Button color={"secondary"} variant={"outlined"}>
          Withdraw
        </Button>
      </Grid>
    </Section>
  )
}
