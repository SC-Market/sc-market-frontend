// Route module: renders <Navigate to={"/market/services"} />. Wired up in src/routes.ts.

import { Navigate, redirect } from "react-router-dom"

export const clientLoader = () => redirect("/market/services")

export default function Redirect() {
  return <Navigate to={"/market/services"} />
}
