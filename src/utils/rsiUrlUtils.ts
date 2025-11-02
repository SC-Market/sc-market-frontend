/**
 * Extracts a Star Citizen profile username from an RSI URL
 * Examples:
 * - https://robertsspaceindustries.com/en/citizens/Khuzdul -> Khuzdul
 * - https://robertsspaceindustries.com/fr/citizens/TestUser -> TestUser
 * - https://robertsspaceindustries.com/citizens/SomeUser -> SomeUser
 * - https://robertsspaceindustries.com/en/citizens/SomeUser/profile -> SomeUser
 */
export function extractProfileIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    
    // Look for /citizens/ pattern (locale prefix is optional, e.g., /en/, /fr/, etc.)
    const citizensIndex = pathParts.indexOf('citizens')
    if (citizensIndex !== -1 && pathParts.length > citizensIndex + 1) {
      return pathParts[citizensIndex + 1]
    }
    
    return null
  } catch {
    // If URL parsing fails, try regex fallback
    // Matches /citizens/ or /{locale}/citizens/ where locale is any 2-5 letter code
    const match = url.match(/\/(?:[a-z]{2,5}\/)?citizens\/([a-zA-Z0-9_-]+)/i)
    return match ? match[1] : null
  }
}

/**
 * Extracts an organization ID from an RSI URL
 * Examples:
 * - https://robertsspaceindustries.com/en/orgs/SCMARKET -> SCMARKET
 * - https://robertsspaceindustries.com/fr/orgs/TestOrg -> TestOrg
 * - https://robertsspaceindustries.com/orgs/MyOrg -> MyOrg
 * - https://robertsspaceindustries.com/en/orgs/MyOrg/profile -> MyOrg
 */
export function extractOrgIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    
    // Look for /orgs/ pattern (locale prefix is optional, e.g., /en/, /fr/, etc.)
    const orgsIndex = pathParts.indexOf('orgs')
    if (orgsIndex !== -1 && pathParts.length > orgsIndex + 1) {
      return pathParts[orgsIndex + 1]
    }
    
    return null
  } catch {
    // If URL parsing fails, try regex fallback
    // Matches /orgs/ or /{locale}/orgs/ where locale is any 2-5 letter code
    const match = url.match(/\/(?:[a-z]{2,5}\/)?orgs\/([a-zA-Z0-9_-]+)/i)
    return match ? match[1] : null
  }
}

/**
 * Sanitizes input to only allow alphanumeric characters, underscores, and hyphens
 * Removes all spaces and other invalid characters
 */
export function sanitizeAlphanumeric(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '')
}

/**
 * Checks if a string is a valid RSI URL (for profiles or orgs)
 * Works with any locale prefix or no prefix
 */
export function isRsiUrl(str: string): boolean {
  // Matches robertsspaceindustries.com with optional locale prefix before /citizens/ or /orgs/
  return /robertsspaceindustries\.com.*\/(?:[a-z]{2,5}\/)?(citizens|orgs)\//i.test(str)
}
