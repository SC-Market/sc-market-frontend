/**
 * Shared V2 test setup — mock @mui/icons-material to avoid resolving 2000+ barrel exports.
 * Import this at the top of every V2 test file (before other imports):
 *   import "./setup";
 */
import React from "react";
import { vi } from "vitest";

vi.mock("@mui/icons-material", () => {
  return new Proxy(
    { __esModule: true },
    {
      get: (_target, prop) => {
        if (prop === "__esModule") return true;
        if (typeof prop !== "string") return undefined;
        const Icon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
          (props, ref) => React.createElement("svg", { ...props, ref, "data-testid": `icon-${prop}` }),
        );
        Icon.displayName = prop;
        return Icon;
      },
    },
  );
});
