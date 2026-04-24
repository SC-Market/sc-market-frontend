import type { OrderTrendDatapoint } from "./types"

export function makeOrderTrend(): {
  data: OrderTrendDatapoint[]
  labels: string[]
} {
  const data: OrderTrendDatapoint[] = [
    { name: "Dec 11", All: 8, Fulfilled: 1, "Not Started": 3, "In-Progress": 4 },
    { name: "Dec 12", All: 12, Fulfilled: 5, "Not Started": 3, "In-Progress": 4 },
    { name: "Dec 13", All: 10, Fulfilled: 3, "Not Started": 2, "In-Progress": 5 },
    { name: "Dec 14", All: 7, Fulfilled: 3, "Not Started": 2, "In-Progress": 2 },
    { name: "Dec 15", All: 15, Fulfilled: 5, "Not Started": 5, "In-Progress": 5 },
  ]
  return { data, labels: ["All", "Fulfilled", "Not Started", "In-Progress"] }
}

export function romanize(num: number): string {
  if (isNaN(num)) return String(NaN)
  const digits = String(+num).split("")
  const key = [
    "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
    "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
    "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX",
  ]
  let roman = ""
  let i = 3
  while (i--) {
    const digit = digits.pop()
    if (digit == null) break
    roman = (key[+digit + i * 10] || "") + roman
  }
  return Array(+digits.join("") + 1).join("M") + roman
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value
  return num.toLocaleString("en-US")
}
