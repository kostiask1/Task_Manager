import { getAuth, onAuthStateChanged } from "firebase/auth"
import React, { useEffect } from "react"
import Messages from "./components/Messages/Messages"
import Navbar from "./components/UI/Navbar"
import Routing from "./routes"
import { getUserById } from "./store/authSlice"
import { RootState, useAppDispatch, useAppSelector } from "./store/store"
import { setLoading } from "./store/appSlice"

function App() {
  const dispatch = useAppDispatch()
  const loading = useAppSelector((state: RootState) => state.app.loading)
  const authenticated = useAppSelector(
    (state: RootState) => state.auth.authenticated
  )

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await dispatch(getUserById(user.uid))
        dispatch(setLoading(false))
      } else {
        dispatch(setLoading(false))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [dispatch])

  console.log("rendered App.tsx")

  console.log("authenticated:", authenticated)

  if (loading) return <div>Loading...</div>
  // (process.env.NODE_ENV === "production" || "development")
  return (
    <React.Fragment>
      <Navbar />
      <Messages />
      <div className="container mt-5">
        <Routing authenticated={authenticated} />
      </div>
    </React.Fragment>
  )
}
export default App
