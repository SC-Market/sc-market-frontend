// Route module: renders <Navigate to={"/guides"} replace />. Wired up in src/routes.ts.

import { Navigate } from "react-router-dom"

export default function Redirect() {
  return <Navigate to={"/guides"} replace />
}
