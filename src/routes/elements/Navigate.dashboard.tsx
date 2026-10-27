// Route module: renders <Navigate to="/dashboard" replace />. Wired up in src/routes.ts.

import { Navigate, replace } from "react-router-dom"

export const clientLoader = () => replace("/dashboard")

export default function Redirect() {
  return <Navigate to="/dashboard" replace />
}
