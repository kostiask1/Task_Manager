import { Navigate } from "react-router-dom"
import { RootState, useAppSelector } from "../../store/store"
import "./Auth.scss"
import SignIn from "./SignIn"
import SignUp from "./SignUp"

const Auth = () => {
  const { authenticated } = useAppSelector((state: RootState) => state.auth)

  if (authenticated) return <Navigate to="/catalog" />

  return (
    <div>
      <div className="columns">
        <div className="column">
          <SignIn />
        </div>
        <div className="column">
          <SignUp />
        </div>
      </div>
    </div>
  )
}

export default Auth
