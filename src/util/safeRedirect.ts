/**
 * Validate an in-app redirect target taken from user-controllable input (e.g.
 * a `?redirect=` query parameter). Returns the path if it's a same-origin
 * relative path, otherwise `fallback`.
 *
 * Rejected: anything not starting with a single "/", protocol-relative "//",
 * backslashes (URL parsers treat "\" like "/", so "/\evil.com" is off-site),
 * and control characters (parsers strip tab/CR/LF, which can form "//host").
 * Mirrors the backend's validateRedirectPath.
 */
export function safeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  if (value.includes("\\")) return fallback
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback
  return value
}
