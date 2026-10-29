export interface LocaleReport {
  missing: string[]
  extra: string[]
  placeholder: string[]
  total: number
}
export function audit(): Record<string, LocaleReport>
