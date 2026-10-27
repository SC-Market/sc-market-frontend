// Route module: /services → /market/services. Wired up in src/routes.ts.

import { Navigate, redirect } from "react-router-dom"

// Redirect before rendering: a <Navigate> alone renders an empty frame first.
export const clientLoader = () => redirect("/market/services")

export default function Redirect() {
  return <Navigate to={"/market/services"} />
}
