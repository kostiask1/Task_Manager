import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"
import Messages from "./components/Messages/Messages"
import Loader from "./components/UI/Loader"
import Navbar from "./components/UI/Navbar"
import Routing from "./routes"
import { loading } from "./store/App/appSlice"
import { getUserById } from "./store/Auth/authSlice"
import { useAppDispatch } from "./store/store"

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await dispatch(getUserById(user.uid))
      } else {
        dispatch(loading(false))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  if (import.meta.env.DEV) console.log("rendered App.tsx")

  return (
    <>
      <Navbar />
      <Messages />
      <div className="container mt-5">
        <Routing />
      </div>
      <Loader />
    </>
  )
}
export default App
