import { FC } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import About from "./pages/About/About"
import Auth from "./pages/Auth/Auth"
import Catalog from "./pages/Catalog/Catalog"
import General from "./pages/Profile/General/General"
import Password from "./pages/Profile/Password/Password"
import Profile from "./pages/Profile/Profile"

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
    children: [
      { path: "/profile", element: <Navigate to="/profile/general" /> },
      { path: "/profile/general", element: <General /> },
      { path: "/profile/password", element: <Password /> },
    ],
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

const unWrapRoute = (route: any) => {
  return (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children?.length &&
        route.children.map((child: any) => unWrapRoute(child))}
    </Route>
  )
}

const Routing: FC<{ authenticated: boolean }> = ({ authenticated }) => {
  return (
    <Routes>
      {routesArray
        .filter((route) => !route.private || authenticated)
        .map((route) => unWrapRoute(route))}
    </Routes>
  )
}

export default Routing
