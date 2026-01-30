/**
 * URL formatters. Market-specific formatters live in features/market/domain/urls
 * and are re-exported here for backward compatibility.
 */

export {
  formatListingSlug,
  formatMarketUrl,
  formatCompleteListingUrl,
  formatMarketMultipleUrl,
} from "../features/market/domain/urls"
export type { FormattableListingType } from "../features/market/domain/urls"

import { Service } from "../datatypes/Order"
import { Contractor } from "../datatypes/Contractor"
import { formatListingSlug } from "../features/market/domain/urls"

export function formatServiceUrl(service: Service) {
  return `/order/service/${service.service_id}/#/${formatListingSlug(
    service.title,
  )}`
}

export function formatContractorUrl(contractor: Contractor) {
  return `/contractor/${contractor?.spectrum_id}/#/${formatListingSlug(
    contractor.name,
  )}`
}
