import { useRef, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { routesArray } from "../../../routes"
import { signout } from "../../../store/authSlice"
import { useAppSelector, RootState, useAppDispatch } from "../../../store/store"
import Button from "../Button"
import "./Navbar.scss"

function Navbar() {
  const location = useLocation()
  const { authenticated, user } = useAppSelector((state: RootState) => ({
    authenticated: state.auth.authenticated,
    user: state.auth.user,
  }))
  const burgerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => toggleNavMenu, [location.pathname])

  const dispatch = useAppDispatch()

  const logout = () => dispatch(signout())

  const isActivePage = (route: string) => location.pathname.includes(route)

  const toggleNavMenu = () => {
    burgerRef.current?.classList.toggle("is-active")
    menuRef.current?.classList.toggle("is-active")
  }

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
            ref={burgerRef}
            onClick={toggleNavMenu}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div
          id="navbarBasicExample"
          ref={menuRef}
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
            {authenticated && user ? (
              <div className="navbar-item has-dropdown is-hoverable">
                <div className="navbar-link">
                  <p className="is-size-6">{user?.firstName || "Profile"}</p>
                  <figure className="image ml-1 is-48x48">
                    <img
                      className="is-rounded"
                      src={
                        user?.profileImg ||
                        "https://bulma.io/images/placeholders/128x128.png"
                      }
                      style={{ maxHeight: "48px" }}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null
                        currentTarget.src =
                          "https://bulma.io/images/placeholders/128x128.png"
                      }}
                      alt="Profile img"
                    />
                  </figure>
                </div>
                <div className="navbar-dropdown is-right">
                  <Link
                    className="is-flex is-flex-direction-row px-2 is-align-items-center"
                    to="profile"
                  >
                    Profile settings
                  </Link>
                  <hr className="navbar-divider" />
                  {authenticated ? (
                    <div className="is-flex mx-2">
                      <Button
                        onClick={logout}
                        className="is-danger is-small"
                        text="Log out"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="navbar-item button signin is-light"
                >
                  Sign In
                </Link>
                <Link to="/signup" className="navbar-item button is-light">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
