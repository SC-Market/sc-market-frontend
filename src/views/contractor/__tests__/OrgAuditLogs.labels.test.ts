/**
 * Org audit-log action labels never loaded: the component looked up
 * "orgAuditLogs.action.<x>", but "orgAuditLogs.action" is the header string
 * and the labels live at "orgAuditLogs.action_<x>".
 */
import { describe, expect, it } from "vitest"
import en from "../../../locales/en/english.json"
import { AUDIT_LOG_ACTIONS, auditActionKey } from "../OrgAuditLogs"

function resolve(key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    en,
  )
}

describe("org audit log action labels", () => {
  it.each(AUDIT_LOG_ACTIONS)("%s has an English label", (action) => {
    expect(typeof resolve(auditActionKey(action))).toBe("string")
  })
})
