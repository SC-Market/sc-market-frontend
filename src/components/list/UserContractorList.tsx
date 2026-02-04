import { Contractor } from "../../datatypes/Contractor"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import {
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import React from "react"

export function UserContractorList(props: {
  contractors: {
    spectrum_id: string
    roles: string[]
    name: string
    role_details?: { role_id: string; role_name: string; position: number }[]
  }[]
}) {
  const { contractors } = props

  return (
    <List sx={{ paddingTop: 0, paddingBottom: 0 }}>
      {contractors ? (
        contractors.map((c) => (
          <UserContractorListItem key={c.contractor_id} membership={c} />
        ))
      ) : (
        <Typography
          color={"text.primary"}
          variant={"subtitle2"}
          fontWeight={600}
        >
          This user is not a part of any organizations
        </Typography>
      )}
    </List>
  )
}

export function UserContractorListItem(props: {
  membership: {
    spectrum_id: string
    roles: string[]
    name: string
    role_details?: { role_id: string; role_name: string; position: number }[]
  }
}) {
  const {
    membership: { spectrum_id, role_details },
  } = props
  const { data: contractor } = useGetContractorBySpectrumIDQuery(spectrum_id)

  // Sort roles by position (lowest position = highest authority)
  // Handle case where role_details might be undefined (backward compatibility)
  // Create a copy to avoid mutating immutable Redux state
  const sortedRoles = [...(role_details || [])].sort(
    (a, b) => a.position - b.position,
  )

  return (
    <ListItem key={contractor?.spectrum_id}>
      <ListItemIcon
        sx={{
          width: 64,
          marginRight: 1,
        }}
      >
        <Link to={`/contractor/${contractor?.spectrum_id}`}>
          <Avatar
            variant={"rounded"}
            src={contractor?.avatar}
            alt={`Avatar of ${contractor?.spectrum_id}`}
            sx={{
              maxHeight: 60,
              maxWidth: 60,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Link>
      </ListItemIcon>
      <ListItemText>
        <Link to={`/contractor/${contractor?.spectrum_id}`}>
          <UnderlineLink
            color={"text.secondary"}
            variant={"subtitle1"}
            fontWeight={600}
            sx={{
              lineHeight: 1.24,
              marginBottom: -0.5,
            }}
          >
            {contractor?.name}
          </UnderlineLink>
        </Link>

        <Typography
          color={"text.primary"}
          variant={"subtitle2"}
          fontWeight={600}
          sx={{ textTransform: "capitalize" }}
        >
          {sortedRoles.map((roleItem, index) => (
            <span key={roleItem.role_id}>
              {roleItem.role_name}
              {index < sortedRoles.length - 1 && ", "}
            </span>
          ))}
        </Typography>
      </ListItemText>
    </ListItem>
  )
}
