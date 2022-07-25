import { FC, useCallback } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"

const General: FC = () => {
  const location = useLocation()

  const isActivePage = useCallback(
    (route: string) => {
      if (location.pathname.includes(route)) {
        return true
      }
      return false
    },
    [location.pathname]
  )

  return (
    <div className="columns">
      <div className="column is-one-quarter">
        <aside className="menu">
          <p className="menu-label">General</p>
          <ul className="menu-list">
            <li>
              <Link
                to="/profile"
                className={!isActivePage("password") ? "is-active" : ""}
              >
                User Info
              </Link>
            </li>
            <li>
              <Link
                to="password"
                className={isActivePage("password") ? "is-active" : ""}
              >
                Password
              </Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className="column mt-5">
        <Outlet />
      </div>
    </div>
  )
}

export default General
