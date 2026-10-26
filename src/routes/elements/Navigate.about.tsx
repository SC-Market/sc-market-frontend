// Route module: renders <Navigate to="about" replace />. Wired up in src/routes.ts.

import { Navigate } from "react-router-dom"

export default function Redirect() {
  return <Navigate to="about" replace />
}
