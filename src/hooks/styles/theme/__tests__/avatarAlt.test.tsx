import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Avatar, ThemeProvider } from "@mui/material"
import type { Theme } from "@mui/material"
import { mainTheme } from "../mainTheme"
import { lightTheme } from "../lightTheme"
import { CUSTOM_THEMES } from "../../custom_themes"
import { ProfileAvatar } from "../../../../features/profile/components/ProfileAvatar"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const themes: [string, Theme][] = [
  ["main", mainTheme],
  ["light", lightTheme],
  ...CUSTOM_THEMES.entries(),
]

describe.each(themes)("%s theme avatar alt", (_name, theme) => {
  it("an avatar image without an alt is decorative (alt=\"\")", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Avatar src="https://example.com/a.png" />
      </ThemeProvider>,
    )
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("")
  })

  it("a named alt wins over the default", () => {
    render(
      <ThemeProvider theme={theme}>
        <Avatar src="https://example.com/a.png" alt="Avatar of henry" />
      </ThemeProvider>,
    )
    expect(screen.getByRole("img", { name: "Avatar of henry" })).toBeTruthy()
  })
})

describe("ProfileAvatar", () => {
  it.each([true, false])(
    "names the profile's avatar (own profile: %s)",
    (isMyProfile) => {
      render(
        <ThemeProvider theme={mainTheme}>
          <ProfileAvatar
            avatar="https://example.com/a.png"
            username="henry"
            isMyProfile={isMyProfile}
            isUploadingAvatar={false}
            onAvatarUpload={() => {}}
            setAvatarFileInputRef={() => {}}
          />
        </ThemeProvider>,
      )
      expect(screen.getByRole("img", { name: "Avatar of henry" })).toBeTruthy()
    },
  )
})
