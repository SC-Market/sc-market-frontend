// Route module: renders <LandingPage />. Wired up in src/routes.ts.

import { shellComponent } from "../shell"
import { prerenderLoader } from "../prerender"

// Prerendered (src/prerender/paths.ts): see ../prerender.ts.
export const loader = prerenderLoader
export default shellComponent("LandingPage")
