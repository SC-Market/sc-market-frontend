// Route module: the EmailVerificationPage page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("EmailVerificationPage")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
