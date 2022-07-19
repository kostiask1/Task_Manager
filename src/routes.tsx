import React from "react"
import { Navigate } from "react-router-dom"
import Auth from "./pages/Auth/Auth"

const routes = (isLoggedIn: boolean) => [
  {
    path: "/",
    element: isLoggedIn ? <div>Logged</div> : <Auth />,
    children: [
      { path: "auth", element: <Auth /> },
      { path: "/", element: <Navigate to="/auth" /> },
    ],
  },
]

export default routes
