// Route module: the app layout (src/app/AppLayout.tsx). Wired up in src/routes.ts.

import { shellComponent } from "../shell"

export default shellComponent("AppLayout")
export const ErrorBoundary = shellComponent("FrontendErrorElement")
