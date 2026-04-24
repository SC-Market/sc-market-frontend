import React, { useMemo } from "react"
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Link as MaterialLink,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { GroupAdd, LinkRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Contractor, ContractorInvite } from "../domain/types"
import { contractorKindIcons } from "../../../views/contractor/ContractorList"
import { useTranslation } from "react-i18next"
import { ShareButton } from "../../../components/buttons/ShareButton"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useGetNotificationsQuery } from "../../../store/notification"
import {
  useAcceptContractorInviteMutation,
} from "../api/contractorApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

interface OrgHeaderProps {
  contractor: Contractor
}

export function OrgHeader({ contractor }: OrgHeaderProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()

  const isMember = profile?.contractors?.some(
    (c) => c.spectrum_id === contractor.spectrum_id,
  )

  // Only check for pending invites if logged in and not already a member
  const { data: inviteNotifs } = useGetNotificationsQuery(
    { action: "contractor_invite", pageSize: 50 },
    { skip: !profile || isMember },
  )

  const hasPendingInvite = useMemo(() => {
    if (!inviteNotifs?.notifications) return false
    return inviteNotifs.notifications.some(
      (n) =>
        (n.entity as ContractorInvite)?.spectrum_id ===
        contractor.spectrum_id,
    )
  }, [inviteNotifs, contractor.spectrum_id])

  const [acceptInvite, { isLoading: isAccepting }] =
    useAcceptContractorInviteMutation()

  const handleAccept = async () => {
    try {
      await acceptInvite({ contractor: contractor.spectrum_id }).unwrap()
      issueAlert({ message: t("org.invite.accepted", "Joined organization!"), severity: "success" })
    } catch {
      issueAlert({ message: t("org.invite.acceptFailed", "Failed to join"), severity: "error" })
    }
  }

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
      <Avatar
        src={contractor.avatar}
        aria-label={t("contractors.contractor")}
        variant="rounded"
        sx={{
          height: theme.spacing(12),
          width: theme.spacing(12),
          flexShrink: 0,
          objectFit: "cover",
        }}
      />
      <Stack spacing={0.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Typography color="text.secondary" variant="h6" fontWeight={600}>
            {contractor.name}
          </Typography>
          {!contractor.spectrum_id.startsWith("~") && (
            <MaterialLink
              component="a"
              href={`https://robertsspaceindustries.com/orgs/${contractor.spectrum_id}`}
              target="_blank"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <IconButton color="primary" size="small">
                <LinkRounded />
              </IconButton>
            </MaterialLink>
          )}
          <ShareButton title={`${contractor.name} - SC Market`} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <PeopleAltRoundedIcon style={{ color: theme.palette.text.primary }} />
          <Typography color="text.primary" fontWeight="bold">
            {contractor.size}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {contractor.fields.map((field) => (
            <Chip
              key={field}
              color="primary"
              label={field}
              sx={{
                padding: 0.5,
                textTransform: "capitalize",
              }}
              size="small"
              variant="outlined"
              icon={contractorKindIcons[field]}
              onClick={(event) => event.stopPropagation()}
            />
          ))}
        </Box>
        {hasPendingInvite && !isMember && (
          <Button
            variant="contained"
            color="success"
            startIcon={<GroupAdd />}
            onClick={handleAccept}
            disabled={isAccepting}
            size="small"
            sx={{ mt: 0.5 }}
          >
            {isAccepting
              ? t("org.invite.joining", "Joining…")
              : t("org.invite.joinOrg", "Join Organization")}
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
