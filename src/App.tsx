import { getAuth, onAuthStateChanged } from "firebase/auth"
import React, { useEffect } from "react"
import Navbar from "./components/UI/Navbar"
import Routing from "./routes"
import { getUserById, setLoading } from "./store/actions/authActions"
import { RootState, useAppDispatch, useAppSelector } from "./store/store"

function App() {
  const dispatch = useAppDispatch()
  const { loading, authenticated } = useAppSelector(
    (state: RootState) => state.auth
  )

  console.log("authenticated:", authenticated)

  // Check if user exists
  useEffect(() => {
    // dispatch(setLoading(true))
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await dispatch(getUserById(user.uid))
      }
      dispatch(setLoading(false))
    })

    return () => {
      unsubscribe()
    }
  }, [dispatch])

  if (loading) return <div>Loading...</div>
  // (process.env.NODE_ENV === "production" || "development")
  return (
    <React.Fragment>
      <Navbar />
      <Routing authenticated={authenticated} />
    </React.Fragment>
  )
}
export default App
