import { FC, Suspense, lazy } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Loader from "./components/UI/Loader/Loader"
import { RootState, useAppSelector } from "./store/store"
import useNetwork from "./hooks/useNetwork"
const Tasks = lazy(() => import("./pages/Tasks"))
const Calendar = lazy(() => import("./pages/Calendar"))
const About = lazy(() => import("./pages/About"))
const Auth = lazy(() => import("./pages/Auth"))
const General = lazy(() => import("./pages/User"))
const Password = lazy(() => import("./pages/User/Password"))
const Profile = lazy(() => import("./pages/User/Profile"))

export const routesArray = [
  {
    name: "Auth",
    private: false,
    show: false,
    path: "auth",
    element: <Auth />,
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
    element: <Tasks />,
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
    name: "About",
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
  const isOnline = useNetwork()

  if (!isOnline) {
    return <div>No internet connection</div>
  }
  return !loading ? (
    <Suspense fallback={<Loader loading={true} />}>
      <Routes>
        <Route path="*" element={<Navigate to="/about" />} />
        {routesArray.map(
          (route) => (!route.private || authenticated) && unWrapRoute(route)
        )}
      </Routes>
    </Suspense>
  ) : null
}

export default Routing
