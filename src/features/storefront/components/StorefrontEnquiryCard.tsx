import React, { useState } from "react"
import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import {
  useGetStorefrontEnquiryQuery,
  type EnquiryContactMethod,
  type EnquiryStatus,
  type EnquiryTargetType,
} from "../../../store/api/v2/market"
import { useCreateStorefrontEnquiry } from "../hooks/useStorefrontEnquiryActions"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { getErrorMessage } from "../../../util/errorHandling"
import {
  ENQUIRY_MESSAGE_MAX,
  enquiryStatusColor,
  isOpenEnquiry,
  subdomainProblem,
  suggestedSubdomain,
} from "../enquiry"
import { useFormatters } from "../../../util/format"

/** "Open", "In progress", … for an enquiry status. */
export function useEnquiryStatusLabel() {
  const { t } = useTranslation()
  return (status: EnquiryStatus) =>
    ({
      open: t("storefront.enquiry.status.open", "Sent"),
      in_progress: t("storefront.enquiry.status.in_progress", "In progress"),
      completed: t("storefront.enquiry.status.completed", "Done"),
      declined: t("storefront.enquiry.status.declined", "Declined"),
    })[status]
}

/**
 * "Enquire about a branded storefront": a form in org settings › Storefront
 * and in shop settings (POST /storefront-enquiries). Staff get it in Admin ›
 * Premium. While an enquiry is open it shows its status instead; after it
 * is closed, a new one can be sent.
 */
export function StorefrontEnquiryCard(props: {
  targetType: EnquiryTargetType
  /** The org's spectrum ID or the shop's ID. */
  targetId: string
  /** The org's spectrum ID or the shop's slug, to suggest the subdomain. */
  handle: string
  /** Without its own paper and title (inside a settings section that has them). */
  bare?: boolean
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const statusLabel = useEnquiryStatusLabel()
  const { data, isLoading, isError } = useGetStorefrontEnquiryQuery({
    targetType: props.targetType,
    targetId: props.targetId,
  })
  const { data: profile } = useGetUserProfileQuery()
  const { send, state: createState } = useCreateStorefrontEnquiry()

  const [subdomain, setSubdomain] = useState(() =>
    suggestedSubdomain(props.handle),
  )
  const [message, setMessage] = useState("")
  const discordHandle = profile?.discord_username || null
  const [contact, setContact] = useState<EnquiryContactMethod>(
    discordHandle ? "discord" : "site_message",
  )
  const [touched, setTouched] = useState(false)

  if (isLoading) return <Skeleton variant="rounded" height={220} />
  if (isError) {
    return (
      <Alert severity="warning">
        {t(
          "storefront.enquiry.loadFailed",
          "Your storefront enquiry couldn't be loaded. Try again later.",
        )}
      </Alert>
    )
  }

  const latest = data?.enquiry ?? null
  const problem = subdomainProblem(subdomain)
  const problemText =
    problem === "length"
      ? t("storefront.enquiry.subdomainLength", "2 to 63 characters")
      : problem === "chars"
        ? t(
            "storefront.enquiry.subdomainChars",
            "Lower-case letters, digits and single hyphens; no hyphen at the start or end",
          )
        : problem === "reserved"
          ? t(
              "storefront.enquiry.subdomainReserved",
              "That subdomain is reserved",
            )
          : null

  const submit = async () => {
    setTouched(true)
    if (problem) return
    const sent = await send({
      target_type: props.targetType,
      target_id: props.targetId,
      requested_subdomain: subdomain.trim().toLowerCase(),
      message: message.trim(),
      contact_method: contact,
    })
    if (sent) {
      setMessage("")
      setTouched(false)
    }
  }

  return (
    <Box
      component={props.bare ? "div" : Paper}
      sx={props.bare ? undefined : { p: 2 }}
      data-testid="storefront-enquiry"
    >
      {!props.bare && (
        <Typography variant="h6" component="h2" color="text.secondary">
          {t("storefront.enquiry.title", "Enquire about a branded storefront")}
        </Typography>
      )}

      {latest && isOpenEnquiry(latest.status) ? (
        <Stack
          spacing={1}
          sx={{ mt: 1 }}
          data-testid="storefront-enquiry-status"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography variant="body2" color="text.primary">
              {t("storefront.enquiry.requested", {
                subdomain: `${latest.requested_subdomain}.sc-market.space`,
                defaultValue: "You asked for {{subdomain}}.",
              })}
            </Typography>
            <Chip
              size="small"
              color={enquiryStatusColor(latest.status)}
              label={statusLabel(latest.status)}
            />
          </Stack>
          <Typography variant="body2" color="text.primary">
            {latest.contact_method === "discord"
              ? t(
                  "storefront.enquiry.replyDiscord",
                  "SC Market staff will contact you on Discord.",
                )
              : t(
                  "storefront.enquiry.replyMessage",
                  "SC Market staff will message you on SC Market.",
                )}
          </Typography>
          <Typography variant="caption" color="text.primary">
            {t("storefront.enquiry.sentBy", {
              date: fmt.date(new Date(latest.created_at)),
              user:
                latest.submitted_by_username ??
                t("storefront.enquiry.deletedUser", "Deleted user"),
              defaultValue: "Sent {{date}} by {{user}}.",
            })}
          </Typography>
        </Stack>
      ) : (
        <Stack
          spacing={2}
          sx={{ mt: 1 }}
          component="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <Typography variant="body2" color="text.primary">
            {t(
              "storefront.enquiry.intro",
              "Ask SC Market staff for a branded storefront on its own sc-market.space subdomain. We'll reply the way you choose below.",
            )}
          </Typography>
          {latest && (
            <Typography
              variant="body2"
              color="text.primary"
              data-testid="storefront-enquiry-previous"
            >
              {t("storefront.enquiry.previous", {
                subdomain: `${latest.requested_subdomain}.sc-market.space`,
                status: statusLabel(latest.status),
                defaultValue: "Your last enquiry ({{subdomain}}): {{status}}.",
              })}
            </Typography>
          )}
          <TextField
            label={t("storefront.enquiry.subdomain", "Subdomain you'd like")}
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            onBlur={() => setTouched(true)}
            size="small"
            inputProps={{
              maxLength: 63,
              "data-testid": "enquiry-subdomain",
              autoCapitalize: "none",
              spellCheck: false,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">.sc-market.space</InputAdornment>
              ),
            }}
            error={touched && !!problem}
            helperText={
              (touched && problemText) ||
              t(
                "storefront.enquiry.subdomainHelp",
                "Usually your org's Spectrum ID or your shop's name.",
              )
            }
            required
          />
          <TextField
            label={t("storefront.enquiry.message", "Message (optional)")}
            value={message}
            onChange={(e) =>
              setMessage(e.target.value.slice(0, ENQUIRY_MESSAGE_MAX))
            }
            multiline
            minRows={3}
            size="small"
            inputProps={{
              maxLength: ENQUIRY_MESSAGE_MAX,
              "data-testid": "enquiry-message",
            }}
            helperText={t("storefront.enquiry.messageHelp", {
              length: message.length,
              max: ENQUIRY_MESSAGE_MAX,
              defaultValue:
                "What you have in mind. Only SC Market staff see it. {{length}}/{{max}}",
            })}
          />
          <FormControl>
            <FormLabel id="enquiry-contact" sx={{ color: "text.secondary" }}>
              {t("storefront.enquiry.contact", "How should we reach you?")}
            </FormLabel>
            <RadioGroup
              aria-labelledby="enquiry-contact"
              value={contact}
              onChange={(e) =>
                setContact(
                  e.target.value === "discord" ? "discord" : "site_message",
                )
              }
            >
              <FormControlLabel
                value="discord"
                control={<Radio size="small" />}
                disabled={!discordHandle}
                label={
                  discordHandle
                    ? t("storefront.enquiry.contactDiscord", {
                        handle: discordHandle,
                        defaultValue: "Discord ({{handle}}, from your profile)",
                      })
                    : t(
                        "storefront.enquiry.contactDiscordNone",
                        "Discord (link Discord in your settings first)",
                      )
                }
              />
              <FormControlLabel
                value="site_message"
                control={<Radio size="small" />}
                label={t(
                  "storefront.enquiry.contactMessage",
                  "A message on SC Market",
                )}
              />
            </RadioGroup>
            <FormHelperText>
              {t(
                "storefront.enquiry.contactHelp",
                "We don't store contact details: we use the Discord account linked to your profile.",
              )}
            </FormHelperText>
          </FormControl>
          {createState.isError && (
            <Alert severity="error">
              {getErrorMessage(createState.error) ??
                t("storefront.enquiry.failed", "The enquiry couldn't be sent.")}
            </Alert>
          )}
          <Box>
            <LoadingButton
              type="submit"
              variant="contained"
              color="secondary"
              loading={createState.isLoading}
              data-testid="enquiry-submit"
            >
              {t("storefront.enquiry.submit", "Send enquiry")}
            </LoadingButton>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
