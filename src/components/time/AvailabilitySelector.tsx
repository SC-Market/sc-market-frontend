import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  AvailabilityHookContext,
  useAvailability,
} from "../../features/availability/hooks/AvailabilityHook"
import { Button, Grid, GridProps, IconButton, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Section } from "../paper/Section"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useFormatters, useNow } from "../../util/format"
const ARROW_MOVES: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

function AvailabilityItem(props: {
  day: number
  slot: number
  value: boolean
  label: string
}) {
  const theme = useTheme<ExtendedTheme>()
  const { day, slot, value, label } = props
  const {
    setClicked,
    startSelect,
    endSelect,
    toggleSlot,
    startedSelect,
    endedSelect,
  } = useAvailability()

  const active = useMemo(() => {
    if (startedSelect && endedSelect) {
      const top = Math.min(startedSelect?.slot, endedSelect?.slot)
      const bottom = Math.max(startedSelect?.slot, endedSelect?.slot)
      const left = Math.min(startedSelect?.day, endedSelect?.day)
      const right = Math.max(startedSelect?.day, endedSelect?.day)

      if (day >= left && day <= right) {
        if (slot >= top && slot <= bottom) {
          return startedSelect.value
        }
      }
    }

    return value
  }, [startedSelect, endedSelect, day, slot, value])

  return (
    <td
      style={{
        backgroundColor: active
          ? theme.palette.success.main
          : theme.palette.action.disabledBackground || theme.palette.grey[700],
      }}
      role="checkbox"
      aria-checked={active}
      aria-label={label}
      data-cell={`${day}-${slot}`}
      // One tab stop for the grid; arrow keys move between cells.
      tabIndex={day === 0 && slot === 0 ? 0 : -1}
      onKeyDown={(e) => {
        const move = ARROW_MOVES[e.key]
        if (move) {
          e.preventDefault()
          e.currentTarget
            .closest("table")
            ?.querySelector<HTMLElement>(
              `[data-cell="${day + move[0]}-${slot + move[1]}"]`,
            )
            ?.focus()
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          toggleSlot(day, slot)
        }
      }}
      onMouseOver={() => endSelect(day, slot)}
      onFocus={() => endSelect(day, slot)}
      onMouseDown={() => startSelect(day, slot)}
      onMouseUp={() => setClicked(false)}
      onTouchMove={() => endSelect(day, slot)}
      onTouchStart={() => startSelect(day, slot)}
      onTouchEnd={() => setClicked(false)}
      draggable={"false"}
    ></td>
  )
}

export function generateInitialSelection(): boolean[] {
  return Array(48 * 7).fill(false)
}

function arrayRotate<T>(orig: T[], count: number) {
  const arr = [...orig]
  const len = arr.length
  arr.push(...arr.splice(0, ((-count % len) + len) % len))
  return arr
}

/** The visitor's UTC offset in half-hour slots (the grid's slot size). */
function useTzOffset(): number {
  const now = useNow()
  return Math.floor(new Date(now).getTimezoneOffset() / 30)
}

export function AvailabilitySelector(props: {
  onSave: (selections: boolean[]) => void
  initialSelections?: boolean[]
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const tzOffset = useTzOffset()
  const { onSave, initialSelections } = props

  const [clicked, setClicked] = useState(false)
  const [startedSelect, setStartedSelect] = useState<{
    day: number
    slot: number
    value: boolean
  } | null>(null)
  const [endedSelect, setEndedSelect] = useState<{
    day: number
    slot: number
  } | null>(null)
  const [selections, setSelections] = useState<boolean[]>(
    arrayRotate(initialSelections || generateInitialSelection(), tzOffset),
  )

  useEffect(() => {
    setSelections(
      arrayRotate(initialSelections || generateInitialSelection(), tzOffset),
    )
  }, [initialSelections, tzOffset])

  // Sunday first, in the page's language. A fixed UTC week, so the names
  // don't depend on the clock or the time zone (server and browser agree).
  const daysOfWeek = useMemo(
    () =>
      [...Array(7).keys()].map((i) =>
        // 2024-01-07 is a Sunday
        fmt.date(Date.UTC(2024, 0, 7 + i), {
          weekday: "short",
          timeZone: "UTC",
        }),
      ),
    [fmt],
  )

  const setClickCallback = useCallback(
    (value: boolean) => {
      if (!value) {
        if (startedSelect && endedSelect) {
          const top = Math.min(startedSelect?.slot, endedSelect?.slot)
          const bottom = Math.max(startedSelect?.slot, endedSelect?.slot)
          const left = Math.min(startedSelect?.day, endedSelect?.day)
          const right = Math.max(startedSelect?.day, endedSelect?.day)

          setSelections((old) => {
            const next = [...old]
            for (let day = left; day <= right; day++) {
              for (let slot = top; slot <= bottom; slot++) {
                next[day * 48 + slot] = startedSelect.value
              }
            }
            return next
          })
        }

        setStartedSelect(null)
        setEndedSelect(null)
      }
      setClicked(value)
    },
    [setClicked, startedSelect, endedSelect],
  )

  return (
    <Section
      xs={12}
      title={`${t("availability.select_availability")} (${Intl.DateTimeFormat(fmt.locale).resolvedOptions().timeZone})`}
    >
      <Grid
        item
        xs={12}
        onMouseDown={() => setClickCallback(true)}
        onMouseUp={() => setClickCallback(false)}
        onTouchStart={() => setClickCallback(true)}
        onTouchEnd={() => setClickCallback(false)}
        sx={{ display: "flex" }}
      >
        <AvailabilityHookContext.Provider
          value={{
            clicked,
            selections,
            setClicked: setClickCallback,
            startSelect: (day, slot) => {
              setEndedSelect(null)
              setStartedSelect({
                day,
                slot,
                value: !selections[day * 48 + slot],
              })
            },
            startedSelect,
            endSelect: (day, slot) => setEndedSelect({ day, slot }),
            toggleSlot: (day, slot) =>
              setSelections((old) => {
                const next = [...old]
                next[day * 48 + slot] = !old[day * 48 + slot]
                return next
              }),
            endedSelect,
          }}
        >
          <table draggable={"false"}>
            <tbody>
              <tr style={{ height: 23.5 }}></tr>
              {[...Array(25).keys()].map((i: number) => (
                <tr
                  key={i}
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    height: 22,
                  }}
                >
                  <td
                    style={{
                      fontSize: 10,
                      position: "relative",
                      top: -10,
                    }}
                    draggable={"false"}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                      }}
                      draggable={"false"}
                    >
                      {`${String(i).padStart(2, "0")}:00`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table style={{ width: "100%", height: 400 }} draggable={"false"}>
            <tbody>
              <tr>
                {daysOfWeek.map((day, i) => (
                  <th key={i}>{day}</th>
                ))}
              </tr>

              {[...Array(48).keys()].map((slot: number) => (
                <tr key={slot} style={{ height: 10 }}>
                  {[...Array(7).keys()].map((day: number) => (
                    <AvailabilityItem
                      key={day * 48 + slot}
                      day={day}
                      slot={slot}
                      value={selections[day * 48 + slot]}
                      label={`${daysOfWeek[day]} ${String(Math.floor(slot / 2)).padStart(2, "0")}:${slot % 2 ? "30" : "00"}`}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </AvailabilityHookContext.Provider>
      </Grid>
      <Grid item>
        <Button
          variant={"contained"}
          onClick={() => onSave(arrayRotate(selections, -tzOffset))}
        >
          {t("availability.save")}
        </Button>
      </Grid>
    </Section>
  )
}

export function AvailabilityDisplay(
  props: { value: boolean[]; name: string } & GridProps,
) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { value, name, ...gridprops } = props
  const tzOffset = useTzOffset()
  const availability = useMemo(
    () => arrayRotate(value, tzOffset),
    [value, tzOffset],
  )
  const { data: profile } = useGetUserProfileQuery()

  // Sunday first, in the page's language. A fixed UTC week, so the names
  // don't depend on the clock or the time zone (server and browser agree).
  const daysOfWeek = useMemo(
    () =>
      [...Array(7).keys()].map((i) =>
        // 2024-01-07 is a Sunday
        fmt.date(Date.UTC(2024, 0, 7 + i), {
          weekday: "short",
          timeZone: "UTC",
        }),
      ),
    [fmt],
  )

  return (
    <Section
      xs={12}
      lg={4}
      md={6}
      title={`${t("availability.availability_for")} ${name} - (${Intl.DateTimeFormat(fmt.locale).resolvedOptions().timeZone})`}
      subtitle={
        profile?.username === name ? (
          <Link to={"/availability"} style={{ color: "inherit" }}>
            <IconButton
              aria-label={t("availability.edit", "Edit availability")}
            >
              <CreateRoundedIcon />
            </IconButton>
          </Link>
        ) : undefined
      }
      {...gridprops}
    >
      <Grid item xs={12} sx={{ display: "flex" }}>
        <table draggable={"false"}>
          <tbody>
            <tr style={{ height: 23.5 }}></tr>
            {[...Array(25).keys()].map((i: number) => (
              <tr
                key={i}
                style={{
                  position: "relative",
                  boxSizing: "border-box",
                  height: 22,
                }}
              >
                <td
                  style={{
                    fontSize: 10,
                    position: "relative",
                    top: -10,
                  }}
                  draggable={"false"}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    }}
                    draggable={"false"}
                  >
                    {`${String(i).padStart(2, "0")}:00`}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table style={{ width: "100%", height: 400 }} draggable={"false"}>
          <tbody>
            <tr>
              {daysOfWeek.map((day, i) => (
                <th key={i}>{day}</th>
              ))}
            </tr>

            {[...Array(48).keys()].map((slot: number) => (
              <tr key={slot} style={{ height: 10 }}>
                {[...Array(7).keys()].map((day: number) => (
                  <td
                    key={day * 48 + slot}
                    style={{
                      backgroundColor: availability[day * 48 + slot]
                        ? theme.palette.success.main
                        : theme.palette.action.disabledBackground ||
                          theme.palette.grey[700],
                    }}
                    draggable={"false"}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Grid>
    </Section>
  )
}
