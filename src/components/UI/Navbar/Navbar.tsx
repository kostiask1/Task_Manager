import React, { useRef, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { routesArray } from "../../../routes"
import { signout } from "../../../store/Auth/slice"
import { useAppSelector, RootState, useAppDispatch } from "../../../store/store"
import Button from "../Button"
import "./Navbar.scss"
import { setSuccess, setError } from "../../../store/App/slice"
import { wishes } from "../../../store/Wish/slice"
import { tasks } from "../../../store/Task/slice"

let lastLocation = ""

function Navbar() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate();
  const { authenticated, user } = useAppSelector((state: RootState) => ({
    authenticated: state.auth.authenticated,
    user: state.auth.user,
  }))

  const burgerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user.id && window.location.pathname.includes(user.id)) {
      const newLocation = window.location.pathname.replace(`/${user.id}`, "")
      navigate(newLocation)
    } else {
      if (hasId(window.location.pathname) && !hasId(lastLocation)) {
        dispatch(wishes([]))
        dispatch(tasks([]))
      }
    }

    lastLocation = window.location.pathname
    burgerRef.current?.classList.remove("is-active")
    menuRef.current?.classList.remove("is-active")
  }, [location.pathname, user.id])

  const hasId = (route: string) => {
    const pathname = route.split("/")
    const hasId = pathname[pathname.length - 1].length === 28

    return hasId
  }

  const logout = () => dispatch(signout())

  const isActivePage = (route: string) => {
    const path = location.pathname.slice(1, location.pathname.length)
    return path == route
  }

  const toggleNavMenu = () => {
    burgerRef.current?.classList.toggle("is-active")
    menuRef.current?.classList.toggle("is-active")
  }

  const copyUserId = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigator.clipboard.writeText(user.id).then(
      () => dispatch(setSuccess("Your ID is copied to clipboard")),
      () => dispatch(setError("Something went wrong"))
    )
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
            data-target="navbar"
            ref={burgerRef}
            onClick={toggleNavMenu}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div
          id="navbar"
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
              <div
                className="navbar-item has-dropdown"
                ref={dropdownRef}
                onClick={() =>
                  dropdownRef.current?.classList.toggle("is-active")
                }
              >
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
                <div className="navbar-dropdown is-right fadeIn">
                  <Link
                    className="is-flex is-flex-direction-row px-2 is-align-items-center"
                    to="profile"
                  >
                    Profile settings
                  </Link>
                  <hr className="navbar-divider" />
                  <div className="buttons-wrap">
                    <Button
                      onClick={copyUserId}
                      text="Copy ID"
                      className="is-info is-small"
                    />
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
