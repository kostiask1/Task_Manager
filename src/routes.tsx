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
const Wishes = lazy(() => import("./pages/Wishlist"))
const Access = lazy(() => import("./pages/Access"))

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
    name: "About",
    private: false,
    show: true,
    visible: true,
    path: "about",
    element: <About />,
  },
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
    name: "Calendar",
    private: true,
    show: false,
    path: "calendar/:uid",
    element: <Calendar />,
  },
  {
    name: "Tasks",
    private: true,
    show: false,
    path: "tasks/:uid",
    element: <Tasks />,
  },
  {
    name: "Wishes",
    private: true,
    show: true,
    path: "wishes",
    element: <Wishes />,
  },
  {
    name: "Wishes",
    private: true,
    show: false,
    path: "wishes/:uid",
    element: <Wishes />,
  },
  {
    name: "Access",
    private: true,
    show: true,
    path: "access",
    element: <Access />,
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
