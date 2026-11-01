import { describe, it, expect } from "vitest"
import {
  groupNotificationsByDay,
  notificationDayGroup,
} from "../domain/formatters"

// Local time throughout: the groups follow the viewer's calendar day.
const now = new Date(2026, 10, 1, 15, 0) // Sun 1 Nov 2026, 15:00

describe("notificationDayGroup", () => {
  it("puts timestamps in today, yesterday, this week or older", () => {
    expect(notificationDayGroup(new Date(2026, 10, 1, 0, 5), now)).toBe("today")
    expect(notificationDayGroup(new Date(2026, 9, 31, 23, 59), now)).toBe(
      "yesterday",
    )
    expect(notificationDayGroup(new Date(2026, 9, 26, 8, 0), now)).toBe("week")
    expect(notificationDayGroup(new Date(2026, 9, 25, 23, 0), now)).toBe(
      "older",
    )
  })

  it("treats a timestamp slightly ahead of the clock as today", () => {
    expect(notificationDayGroup(new Date(2026, 10, 1, 15, 1), now)).toBe(
      "today",
    )
  })
})

describe("groupNotificationsByDay", () => {
  it("keeps the order and drops empty groups", () => {
    const items = [
      { id: "a", timestamp: new Date(2026, 10, 1, 14).toISOString() },
      { id: "b", timestamp: new Date(2026, 10, 1, 9).toISOString() },
      { id: "c", timestamp: new Date(2026, 8, 1).toISOString() },
    ]
    expect(
      groupNotificationsByDay(items, now).map((g) => [
        g.group,
        g.items.map((i) => i.id),
      ]),
    ).toEqual([
      ["today", ["a", "b"]],
      ["older", ["c"]],
    ])
  })

  it("returns no groups for no notifications", () => {
    expect(groupNotificationsByDay([], now)).toEqual([])
  })
})
