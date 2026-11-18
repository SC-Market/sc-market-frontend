// Route module: the ChooseShopToSell page (/market/create). Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("ChooseShopToSell")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
