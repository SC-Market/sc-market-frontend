import { Link as RouterLink } from "react-router-dom"
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material"
import { Groups, Settings } from "@mui/icons-material"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { ORG_PATHS } from "../../routes/paths"

export function MyOrgs() {
  const { data: profile } = useGetUserProfileQuery()
  const orgs = profile?.contractors || []

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        My Organizations
      </Typography>

      {orgs.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 6 }}>
          <Groups sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            You're not a member of any organizations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Join or create an organization to collaborate with others
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to={ORG_PATHS.register}
          >
            Create Organization
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {orgs.map((org) => (
            <Grid item xs={12} sm={6} md={4} key={org.spectrum_id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Avatar
                      src={org.avatar || undefined}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    >
                      {org.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" noWrap>{org.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {org.spectrum_id}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={ORG_PATHS.profile(org.spectrum_id)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Settings />}
                    component={RouterLink}
                    to={ORG_PATHS.manage(org.spectrum_id)}
                  >
                    Manage
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
