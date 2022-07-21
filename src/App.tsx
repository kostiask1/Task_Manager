import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"
import Messages from "./components/Messages/Messages"
import Loader from "./components/UI/Loader"
import Navbar from "./components/UI/Navbar"
import Routing from "./routes"
import { getUserById } from "./store/authSlice"
import { RootState, useAppDispatch, useAppSelector } from "./store/store"
import { setLoading } from "./store/appSlice"

function App() {
  const dispatch = useAppDispatch()
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

  // (process.env.NODE_ENV === "production" || "development")
  return (
    <>
      <Navbar />
      <Messages />
      <div className="container mt-5">
        <Routing authenticated={authenticated} />
      </div>
      <Loader />
    </>
  )
}
export default App
