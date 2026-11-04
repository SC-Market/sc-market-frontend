import { describe, it, expect } from "vitest"
import { pushDeviceState } from "../components/PushSetupPanel"

const base = {
  ready: true,
  isConfigured: true,
  isSupported: true,
  isIOS: false,
  isInstalled: false,
  permission: "default" as NotificationPermission,
  subscribedHere: false as boolean | null,
}

describe("pushDeviceState", () => {
  it("is checking until the browser has been read", () => {
    expect(pushDeviceState({ ...base, ready: false })).toBe("checking")
  })

  it("needs a VAPID key before anything else", () => {
    expect(pushDeviceState({ ...base, isConfigured: false })).toBe(
      "unconfigured",
    )
  })

  it("asks iOS Safari to add the Home Screen app, even though it has no PushManager", () => {
    expect(pushDeviceState({ ...base, isIOS: true, isSupported: false })).toBe(
      "ios-install",
    )
    expect(pushDeviceState({ ...base, isIOS: true, isInstalled: true })).toBe(
      "off",
    )
  })

  it("reports browsers without the Push API as unsupported", () => {
    expect(pushDeviceState({ ...base, isSupported: false })).toBe("unsupported")
  })

  it("shows blocked when permission is denied", () => {
    expect(pushDeviceState({ ...base, permission: "denied" })).toBe("denied")
  })

  it("offers Enable when permission was never asked, or granted but this device isn't subscribed", () => {
    expect(pushDeviceState(base)).toBe("off")
    expect(pushDeviceState({ ...base, permission: "granted" })).toBe("off")
  })

  it("is on only when this device's subscription is on the account", () => {
    expect(
      pushDeviceState({ ...base, permission: "granted", subscribedHere: true }),
    ).toBe("on")
    expect(
      pushDeviceState({ ...base, permission: "granted", subscribedHere: null }),
    ).toBe("checking")
  })
})
