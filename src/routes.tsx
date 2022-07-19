import Auth from "./pages/Auth/Auth"
import Catalog from "./pages/Catalog/Catalog"
import Profile from "./pages/Profile/Profile"
import React from "react"
import { Outlet, Navigate } from "react-router-dom"
import About from "./pages/About/About"

export const routesArray = [
  {
    name: "Auth",
    private: false,
    show: false,
    path: "auth",
    element: <Auth />,
  },
  {
    name: "Catalog",
    private: false,
    show: true,
    visible: true,
    path: "catalog",
    element: <Catalog />,
  },
  {
    name: "Catalog",
    private: false,
    path: "/",
    element: <Navigate to="catalog" />,
  },
  {
    name: "Profile",
    private: true,
    show: false,
    path: "profile",
    element: <Profile />,
  },
  {
    name: "About Us",
    private: false,
    show: true,
    visible: true,
    path: "about",
    element: <About />,
  },
]

const routes = (isLoggedIn: boolean) => [
  {
    path: "",
    element: <Outlet />,
    children: routesArray.map((route) => {
      const clone = { ...route }
      if (!isLoggedIn) {
        if (clone.private) {
          clone.element = <Navigate to="/auth" />
        }
      }
      return clone
    }),
  },
]

export default routes
