import { FC, lazy, Suspense, ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Loader from "./components/UI/Loader/Loader"
import useNetwork from "./hooks/useNetwork"
import { RootState, useAppSelector } from "./store/store"
const Tasks = lazy(() => import("./pages/Tasks"))
const Calendar = lazy(() => import("./pages/Calendar"))
const About = lazy(() => import("./pages/About"))
const SignIn = lazy(() => import("./pages/Auth/SignIn"))
const SignUp = lazy(() => import("./pages/Auth/SignUp"))
const General = lazy(() => import("./pages/User"))
const Password = lazy(() => import("./pages/User/Password"))
const Profile = lazy(() => import("./pages/User/Profile"))

interface RouteProps {
  path: string
  element?: ReactNode
  children?: RouteProps[]
}

interface RoutesArray extends RouteProps {
  name: string
  private?: boolean
  visible?: boolean
  show?: boolean
}

export const routesArray: RoutesArray[] = [
  {
    name: "SignIn",
    private: false,
    show: false,
    path: "signin",
    element: <SignIn />,
  },
  {
    name: "SignUp",
    private: false,
    show: false,
    path: "signup",
    element: <SignUp />,
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

const unWrapRoute = (route: RouteProps) => {
  return (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children?.length &&
        route.children.map((child: RouteProps) => unWrapRoute(child))}
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
