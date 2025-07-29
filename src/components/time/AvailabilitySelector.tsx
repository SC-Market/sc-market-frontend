import moment from "moment/moment"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  AvailabilityHookContext,
  useAvailability,
} from "../../hooks/time/AvailabilityHook"
import { Button, Grid, GridProps, IconButton } from "@mui/material"
import { Section } from "../paper/Section"
import { useGetUserProfileQuery } from "../../store/profile"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

function AvailabilityItem(props: {
  day: number
  slot: number
  value: boolean
}) {
  const { day, slot, value } = props
  const {
    clicked,
    setClicked,
    startSelect,
    endSelect,
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
      style={{ backgroundColor: active ? "#595" : "#555" }}
      onMouseOver={() => endSelect(day, slot)}
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

const tzOffset = Math.floor(new Date().getTimezoneOffset() / 30)

export function AvailabilitySelector(props: {
  onSave: (selections: boolean[]) => any
  initialSelections?: boolean[]
}) {
  const { t } = useTranslation()
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
  }, [initialSelections])

  const setClickCallback = useCallback(
    (value: boolean) => {
      if (!value) {
        if (startedSelect && endedSelect) {
          const top = Math.min(startedSelect?.slot, endedSelect?.slot)
          const bottom = Math.max(startedSelect?.slot, endedSelect?.slot)
          const left = Math.min(startedSelect?.day, endedSelect?.day)
          const right = Math.max(startedSelect?.day, endedSelect?.day)

          for (let day = left; day <= right; day++) {
            for (let slot = top; slot <= bottom; slot++) {
              setSelections((old) => {
                old[day * 48 + slot] = startedSelect.value
                return old
              })
            }
          }
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
      title={`${t("availability.select_availability")} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`}
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
                      {moment().startOf("day").add(i, "hours").format("HH:mm")}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table style={{ width: "100%", height: 400 }} draggable={"false"}>
            <tbody>
              <tr>
                {[...Array(7).keys()].map((i) => (
                  <th key={i}>{moment().startOf("week").add(i, "days").format("ddd")}</th>
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
  const { t } = useTranslation()
  const { value, name, ...gridprops } = props
  const availability = useMemo(() => arrayRotate(value, tzOffset), [value])
  const { data: profile } = useGetUserProfileQuery()

  return (
    <Section
      xs={12}
      lg={4}
      md={6}
      title={`${t("availability.availability_for")} ${name} - (${Intl.DateTimeFormat().resolvedOptions().timeZone})`}
      subtitle={
        profile?.username === name ? (
          <Link to={"/availability"} style={{ color: "inherit" }}>
            <IconButton>
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
                    {moment().startOf("day").add(i, "hours").format("HH:mm")}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table style={{ width: "100%", height: 400 }} draggable={"false"}>
          <tbody>
            <tr>
              {[...Array(7).keys()].map((i) => (
                <th key={i}>{moment().startOf("week").add(i, "days").format("ddd")}</th>
              ))}
            </tr>

            {[...Array(48).keys()].map((slot: number) => (
              <tr key={slot} style={{ height: 10 }}>
                {[...Array(7).keys()].map((day: number) => (
                  <td
                    key={day * 48 + slot}
                    style={{
                      backgroundColor: availability[day * 48 + slot]
                        ? "#595"
                        : "#555",
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
