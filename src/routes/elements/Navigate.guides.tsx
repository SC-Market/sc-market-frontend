// Route module: renders <Navigate to={"/guides"} replace />. Wired up in src/routes.ts.

import { Navigate, replace } from "react-router-dom"

export const clientLoader = () => replace("/guides")

export default function Redirect() {
  return <Navigate to={"/guides"} replace />
}
