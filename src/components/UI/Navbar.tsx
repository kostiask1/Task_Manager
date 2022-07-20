import { Link, useLocation } from "react-router-dom"
import Button from "./Button"
import { routesArray } from "../../routes"
import { RootState, useAppSelector, useAppDispatch } from "../../store/store"
import { useCallback } from "react"
import { signout } from "../../store/actions/authActions"

function Navbar() {
  const location = useLocation()
  const { authenticated, user } = useAppSelector(
    (state: RootState) => state.auth
  )
  const dispatch = useAppDispatch()

  const logout = () => dispatch(signout())

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
    <nav
      className="navbar has-background-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <img
              src="https://i.pinimg.com/originals/f6/32/22/f63222678d884a9a7449f1949fd24fec.png"
              width="40"
              height="40"
              style={{ maxHeight: "40px" }}
              alt="logo"
            />
          </Link>
          <button
            className="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div
          id="navbarBasicExample"
          className="navbar-menu is-align-items-center"
        >
          <div className="navbar-start">
            {routesArray
              .filter(
                (route) =>
                  route.visible ||
                  (route.private === authenticated && route.show)
              )
              .map((route) =>
                !isActivePage(route.path) ? (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="navbar-item is-size-6"
                  >
                    {route.name}
                  </Link>
                ) : (
                  <button
                    key={route.path}
                    className="navbar-item has-background-white is-size-6"
                    style={{ opacity: 1, border: "unset" }}
                    disabled
                  >
                    {route.name}
                  </button>
                )
              )}
          </div>
          <div className="navbar-end">
            {user ? (
              <div className="navbar-item has-dropdown is-hoverable">
                <p className="navbar-link">More</p>
                <div className="navbar-dropdown is-right">
                  <Link
                    className="is-flex is-flex-direction-row px-2 is-align-items-center is-justify-content-space-around"
                    to="profile"
                  >
                    <p>{user?.firstName || "Profile"}</p>
                    <figure className="image ml-1 is-48x48">
                      <img
                        className="is-rounded"
                        src={
                          user?.profileImg ||
                          "https://bulma.io/images/placeholders/128x128.png"
                        }
                        style={{ maxHeight: "48px" }}
                        alt="Profile img"
                      />
                    </figure>
                  </Link>
                  <hr className="navbar-divider" />
                  {authenticated ? (
                    <div className="is-flex mx-4">
                      <Button
                        onClick={logout}
                        className="is-danger"
                        text="Log out"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <Link to="auth" className="navbar-item button is-light">
                Auth
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
