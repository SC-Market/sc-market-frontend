// Route module: renders <Navigate to={"/market/services"} />. Wired up in src/routes.ts.

import { Navigate } from "react-router-dom"

export default function Redirect() {
  return <Navigate to={"/market/services"} />
}
