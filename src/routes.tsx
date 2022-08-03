import React, { FC, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Loader from "./components/UI/Loader/Loader"
import Board from "./pages/TaskManagers/Board/Board"
import { RootState, useAppSelector } from "./store/store"
import Calendar from "./pages/Calendar/Calendar"
const About = React.lazy(() => import("./pages/About"))
const Auth = React.lazy(() => import("./pages/Auth"))
const Catalog = React.lazy(() => import("./pages/Catalog"))
const General = React.lazy(() => import("./pages/User"))
const Password = React.lazy(() => import("./pages/User/Password"))
const Profile = React.lazy(() => import("./pages/User/Profile"))

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
    name: "Calendar",
    private: true,
    show: true,
    path: "calendar",
    element: <Calendar />,
  },
  {
    name: "Tasks",
    private: true,
    show: true,
    path: "tasks",
    element: <Board />,
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
    element: <General />,
    children: [
      { path: "/profile", element: <Profile /> },
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

const Routing: FC = () => {
  const { authenticated, loading } = useAppSelector((state: RootState) => ({
    authenticated: state.auth.authenticated,
    loading: state.app.loading,
  }))
  return !loading ? (
    <Suspense fallback={<Loader loading={true} />}>
      <Routes>
        <Route path="*" element={<Navigate to="/catalog" />} />
        {routesArray.map(
          (route) => (!route.private || authenticated) && unWrapRoute(route)
        )}
      </Routes>
    </Suspense>
  ) : null
}

export default Routing
