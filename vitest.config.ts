import { configDefaults, defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react-swc"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/setupTests.ts",
    // Agent/tool git worktrees live under .claude/; never run their copies.
    exclude: [...configDefaults.exclude, "**/.claude/**"],
    // No test depends on processed CSS files (MUI styles come from Emotion at
    // runtime), and processing CSS for every test file is slow.
    css: false,
    pool: "forks",
    server: {
      deps: {
        inline: ["@exodus/bytes", "@mui/x-data-grid"],
      },
    },
    coverage: {
      provider: "v8",
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/router/**/*.{ts,tsx}",
        "src/store/**/*.{ts,tsx}",
        "src/util/**/*.{ts,tsx}",
      ],
      exclude: ["**/__tests__/**", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    },
  },
})
