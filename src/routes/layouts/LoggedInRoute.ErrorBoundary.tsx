// Route module: <LoggedInRoute> layout. Wired up in src/routes.ts.

import { shellComponent } from "../shell"

export default shellComponent("LoggedInRoute")
export const ErrorBoundary = shellComponent("RouteErrorFallback")
