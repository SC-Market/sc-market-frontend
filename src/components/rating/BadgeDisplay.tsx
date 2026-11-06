import {
  AccessTimeRounded,
  AutoAwesomeRounded,
  AutoGraphRounded,
  WhatshotRounded,
  WorkspacePremiumRounded,
  TrendingUpRounded,
  BoltRounded,
  CalendarTodayRounded,
  RocketLaunchRounded,
  FavoriteRounded,
} from "@mui/icons-material"
import { Box, Tooltip } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import {
  BADGE_RATING_99_9,
  BADGE_RATING_99,
  BADGE_RATING_95,
  BADGE_RATING_90,
  BADGE_STREAK_PRO,
  BADGE_STREAK_GOLD,
  BADGE_STREAK_SILVER,
  BADGE_STREAK_COPPER,
  BADGE_VOLUME_PRO,
  BADGE_VOLUME_GOLD,
  BADGE_VOLUME_SILVER,
  BADGE_VOLUME_COPPER,
  BADGE_POWER_SELLER,
  BADGE_BUSY_SELLER,
  BADGE_ACTIVE_SELLER,
  BADGE_SPEED_PRO,
  BADGE_SPEED_GOLD,
  BADGE_SPEED_SILVER,
  BADGE_SPEED_COPPER,
  BADGE_CONSISTENCY_PRO,
  BADGE_CONSISTENCY_GOLD,
  BADGE_CONSISTENCY_SILVER,
  BADGE_CONSISTENCY_COPPER,
  BADGE_DONOR_PRO,
  BADGE_DONOR_GOLD,
  BADGE_DONOR_SILVER,
  BADGE_DONOR_COPPER,
  BADGE_EARLY_ADOPTER,
  BADGE_RESPONSIVE,
} from "../../util/badges"

// Badge display component that renders badges based on badge IDs
export function BadgeDisplay(props: {
  badges: string[]
  iconSize?: string | number
}) {
  const { badges, iconSize } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Create unique gradient ID for each instance to avoid conflicts
  const gradientId = `linearColors-${Math.random().toString(36).substr(2, 9)}`

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        alignItems: "center",
        lineHeight: 1,
        "& svg, & .MuiSvgIcon-root": {
          fontSize: iconSize || "1em",
          verticalAlign: "middle",
          display: "inline-flex",
        },
        "& > *": {
          display: "inline-flex",
          alignItems: "center",
          lineHeight: 1,
        },
      }}
    >
      {/* Rating badges */}
      {badges.includes(BADGE_RATING_99_9) && (
        <Tooltip title={t("listing.99_9PercentRating25PlusTransactions")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={gradientId}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.primary.light} />
              </linearGradient>
            </svg>
            <AutoAwesomeRounded
              sx={{
                fill: `url(#${gradientId})`,
                fontSize: "inherit",
                verticalAlign: "middle",
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_99) && (
        <Tooltip title={t("listing.99PercentRating25PlusTransactions")}>
          <AutoAwesomeRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_95) && (
        <Tooltip title={t("listing.95PercentRating25PlusTransactions")}>
          <AutoAwesomeRounded
            sx={{ color: theme.palette.common.badge.silver }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_90) && (
        <Tooltip title={t("listing.90PercentRating25PlusTransactions")}>
          <AutoGraphRounded sx={{ color: theme.palette.common.badge.bronze }} />
        </Tooltip>
      )}

      {/* Volume badges */}
      {badges.includes(BADGE_VOLUME_PRO) && (
        <Tooltip title={t("listing.5000PlusOrdersCompleted")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-volume`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.primary.light} />
              </linearGradient>
            </svg>
            <WorkspacePremiumRounded
              sx={{
                fill: `url(#${gradientId}-volume)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_GOLD) && (
        <Tooltip title={t("listing.1000PlusOrdersCompleted")}>
          <WorkspacePremiumRounded
            sx={{ color: theme.palette.common.badge.gold }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_SILVER) && (
        <Tooltip title={t("listing.500PlusOrdersCompleted")}>
          <WorkspacePremiumRounded
            sx={{ color: theme.palette.common.badge.silver }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_COPPER) && (
        <Tooltip title={t("listing.100PlusOrdersCompleted")}>
          <WorkspacePremiumRounded
            sx={{ color: theme.palette.common.badge.bronze }}
          />
        </Tooltip>
      )}

      {/* Streak badges */}
      {badges.includes(BADGE_STREAK_PRO) && (
        <Tooltip title={t("listing.50PlusFiveStarStreak")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-streak`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.primary.light} />
              </linearGradient>
            </svg>
            <WhatshotRounded
              sx={{
                fill: `url(#${gradientId}-streak)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_GOLD) && (
        <Tooltip title={t("listing.25PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_SILVER) && (
        <Tooltip title={t("listing.15PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: theme.palette.common.badge.silver }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_COPPER) && (
        <Tooltip title={t("listing.5PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: theme.palette.common.badge.bronze }} />
        </Tooltip>
      )}

      {/* Activity badges */}
      {badges.includes(BADGE_POWER_SELLER) && (
        <Tooltip title={t("listing.20PlusOrdersLast30Days")}>
          <TrendingUpRounded sx={{ color: theme.palette.error.main }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_BUSY_SELLER) && (
        <Tooltip title={t("listing.10PlusOrdersLast30Days")}>
          <TrendingUpRounded sx={{ color: theme.palette.warning.main }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_ACTIVE_SELLER) && (
        <Tooltip title={t("listing.5PlusOrdersLast30Days")}>
          <TrendingUpRounded color={"primary"} />
        </Tooltip>
      )}

      {/* Speed badges */}
      {badges.includes(BADGE_SPEED_PRO) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan3Hours")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-speed`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.primary.light} />
              </linearGradient>
            </svg>
            <BoltRounded
              sx={{
                fill: `url(#${gradientId}-speed)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_GOLD) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan6Hours")}>
          <BoltRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_SILVER) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan12Hours")}>
          <BoltRounded sx={{ color: theme.palette.common.badge.silver }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_COPPER) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan24Hours")}>
          <BoltRounded sx={{ color: theme.palette.common.badge.bronze }} />
        </Tooltip>
      )}

      {/* Consistency badges */}
      {badges.includes(BADGE_CONSISTENCY_PRO) && (
        <Tooltip title={t("listing.activeSellerFor3PlusYears")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-consistency`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.primary.light} />
              </linearGradient>
            </svg>
            <CalendarTodayRounded
              sx={{
                fill: `url(#${gradientId}-consistency)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_GOLD) && (
        <Tooltip title={t("listing.activeSellerFor2PlusYears")}>
          <CalendarTodayRounded
            sx={{ color: theme.palette.common.badge.gold }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_SILVER) && (
        <Tooltip title={t("listing.activeSellerFor1PlusYear")}>
          <CalendarTodayRounded
            sx={{ color: theme.palette.common.badge.silver }}
          />
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_COPPER) && (
        <Tooltip title={t("listing.activeSellerFor6PlusMonths")}>
          <CalendarTodayRounded
            sx={{ color: theme.palette.common.badge.bronze }}
          />
        </Tooltip>
      )}

      {/* Donor badges */}
      {badges.includes(BADGE_DONOR_PRO) && (
        <Tooltip title={t("listing.donor12PlusMonths")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-donor`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.secondary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.light} />
              </linearGradient>
            </svg>
            <FavoriteRounded
              sx={{
                fill: `url(#${gradientId}-donor)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_DONOR_GOLD) && (
        <Tooltip title={t("listing.donor6PlusMonths")}>
          <FavoriteRounded sx={{ color: theme.palette.common.badge.gold }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_DONOR_SILVER) && (
        <Tooltip title={t("listing.donor3PlusMonths")}>
          <FavoriteRounded sx={{ color: theme.palette.common.badge.silver }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_DONOR_COPPER) && (
        <Tooltip title={t("listing.donor1PlusMonth")}>
          <FavoriteRounded sx={{ color: theme.palette.common.badge.bronze }} />
        </Tooltip>
      )}

      {/* Early adopter badge */}
      {badges.includes(BADGE_EARLY_ADOPTER) && (
        <Tooltip title={t("listing.earlyPlatformAdopter")}>
          <RocketLaunchRounded
            sx={{ color: theme.palette.common.badge.purple }}
          />
        </Tooltip>
      )}

      {/* Responsive badge */}
      {badges.includes(BADGE_RESPONSIVE) && (
        <Tooltip title={t("listing.responsiveBadge")}>
          <AccessTimeRounded color={"success"} />
        </Tooltip>
      )}
    </Box>
  )
}
