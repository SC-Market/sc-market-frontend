import type { TFunction } from "i18next"
import { type IdentityActionKind } from "../../store/api/v2/market"

export const REASON_MIN = 5

export const REASON_MAX = 500

export function kindLabel(kind: IdentityActionKind, t: TFunction): string {
  switch (kind) {
    case "username_released":
      return t("adminIdentity.kinds.username_released", "Username released")
    case "discord_unlinked":
      return t("adminIdentity.kinds.discord_unlinked", "Discord unlinked")
    case "spectrum_cleared":
      return t("adminIdentity.kinds.spectrum_cleared", "Spectrum link cleared")
    case "spectrum_set":
      return t("adminIdentity.kinds.spectrum_set", "Spectrum id set")
    case "account_deactivated":
      return t("adminIdentity.kinds.account_deactivated", "Account deactivated")
    case "account_reactivated":
      return t("adminIdentity.kinds.account_reactivated", "Account reactivated")
    case "discord_link_skipped":
      return t(
        "adminIdentity.kinds.discord_link_skipped",
        "Discord not linked (held by another account)",
      )
  }
}
