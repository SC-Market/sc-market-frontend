export function displayLocaleNumber(old: number, _new: string): number {
  if (!_new) {
    return 0
  }
  const root = +_new
    .replaceAll(",", "")
    .replaceAll(".", "")
    .replaceAll(" ", "")
    .replaceAll(" ", "")

  if (!isNaN(root)) {
    return root || 0
  }

  return old
}

const URL_PATTERN =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
export const URL_REGEX = new RegExp(URL_PATTERN)
