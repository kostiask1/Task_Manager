import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"
import Messages from "./components/Messages/Messages"
import Loader from "./components/UI/Loader"
import Navbar from "./components/UI/Navbar"
import Routing from "./routes"
import { loading } from "./store/App/slice"
import { getCurrentUser } from './store/Auth/slice'
import { useAppDispatch } from "./store/store"

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await dispatch(getCurrentUser(user.uid))
      } else {
        dispatch(loading(false))
      }
    })

    return () => unsubscribe()
  }, [])

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
