/**
 * Test-account credentials file (docs/testing-with-mcp.md, section 6): the
 * format agents read from ~/.config/scmarket-test-accounts.json,
 *
 *   { "<username>": { "username": "...", "secret": "<base32>", "otpauth_uri": "otpauth://..." } }
 *
 * Several downloads merge with a plain object spread (or `jq -s add`). The
 * secret only exists in the browser right after creation: nothing here talks
 * to the API, and there is no endpoint that returns a secret later.
 */
export const CREDENTIALS_FILENAME = "scmarket-test-accounts.json"

export interface TestAccountCredential {
  username: string
  secret: string
  otpauth_uri: string
}

export type CredentialsFile = Record<string, TestAccountCredential>

export function credentialsFile(accounts: TestAccountCredential[]): CredentialsFile {
  const file: CredentialsFile = {}
  for (const a of accounts) {
    file[a.username] = { username: a.username, secret: a.secret, otpauth_uri: a.otpauth_uri }
  }
  return file
}

export function credentialsJson(accounts: TestAccountCredential[]): string {
  return `${JSON.stringify(credentialsFile(accounts), null, 2)}\n`
}

/** Save `json` through a Blob URL that is revoked right after the click. */
export function downloadJson(json: string, filename: string = CREDENTIALS_FILENAME): void {
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }))
  try {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
