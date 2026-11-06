import { useFormatters } from "../../../util/format"
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material"
import {
  AddBoxRounded,
  DeleteRounded,
  IosShareRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import type { PushSubscription } from "../domain/types"

/** Steps to add SC Market to the iOS Home Screen, where Web Push works. */
export function IosInstallSteps() {
  const { t } = useTranslation()
  return (
    <Box
      component="ol"
      sx={{
        m: 0,
        pl: 3,
        color: "text.secondary",
        "& li": { mb: 1 },
        "& svg": { verticalAlign: "middle", mx: 0.5 },
      }}
      aria-label={t(
        "settings.pushNotifications.iosStepsLabel",
        "How to add SC Market to your Home Screen",
      )}
    >
      <li>
        <Typography variant="body2" component="span">
          {t(
            "settings.pushNotifications.iosStep1",
            "In Safari, tap the Share button",
          )}
          <IosShareRounded fontSize="small" aria-hidden />
        </Typography>
      </li>
      <li>
        <Typography variant="body2" component="span">
          {t(
            "settings.pushNotifications.iosStep2",
            "Scroll down and tap Add to Home Screen",
          )}
          <AddBoxRounded fontSize="small" aria-hidden />
        </Typography>
      </li>
      <li>
        <Typography variant="body2" component="span">
          {t(
            "settings.pushNotifications.iosStep3",
            "Open SC Market from your Home Screen, come back to this page and tap Enable push notifications.",
          )}
        </Typography>
      </li>
    </Box>
  )
}

/** Push subscriptions on the user's other devices, each removable. */
export function OtherPushDevices({
  otherDevices,
  handleUnsubscribe,
}: {
  otherDevices: PushSubscription[]
  handleUnsubscribe: (subscriptionId: string) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  return (
    <Box>
      <Typography
        component="h3"
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: "bold" }}
      >
        {t(
          "settings.pushNotifications.otherDevicesTitle",
          "Other devices with push on",
        )}
      </Typography>
      <List dense disablePadding>
        {otherDevices.map((subscription) => {
          const device =
            subscription.user_agent ||
            t("settings.pushNotifications.unknownDevice")
          return (
            <ListItem
              key={subscription.subscription_id}
              disableGutters
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={t(
                    "settings.pushNotifications.removeDeviceNamed",
                    {
                      device,
                      defaultValue: "Remove {{device}}",
                    },
                  )}
                  onClick={() =>
                    handleUnsubscribe(subscription.subscription_id)
                  }
                >
                  <DeleteRounded fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={device}
                secondary={t("settings.pushNotifications.subscribedOn", {
                  date: fmt.date(subscription.created_at),
                })}
                primaryTypographyProps={{
                  color: "text.secondary",
                  sx: { wordBreak: "break-word", pr: 4 },
                }}
                secondaryTypographyProps={{ color: "text.primary" }}
              />
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}
