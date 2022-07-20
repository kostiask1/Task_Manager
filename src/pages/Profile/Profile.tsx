import { FC, useCallback } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"

const Profile: FC = () => {
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
    <div className="container mt-5">
      <div className="columns">
        <div className="column is-one-quarter">
          <aside className="menu">
            <p className="menu-label">General</p>
            <ul className="menu-list">
              <li>
                <Link
                  to="general"
                  className={isActivePage("general") ? "is-active" : ""}
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
        <div className="column">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Profile
