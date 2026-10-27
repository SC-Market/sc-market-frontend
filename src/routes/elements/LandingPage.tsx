// Route module: renders <LandingPage />. Wired up in src/routes.ts.

import { shellComponent } from "../shell"
import { prerenderLoader } from "../prerender"

// Prerendered (src/prerender/paths.ts): see ../prerender.ts.
export const loader = prerenderLoader
// The homepage loads its data in the browser: with only a server loader,
// React Router would fetch /_root.data on every client-side navigation to /.
export const clientLoader = () => null
export default shellComponent("LandingPage")
