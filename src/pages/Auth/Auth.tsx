import { Navigate } from "react-router-dom"
import { useAppSelector, RootState } from "../../store/store"
import "./Auth.scss"
import SignIn from "./SignIn"
import SignUp from "./SignUp"
import Message from "../../components/UI/Message"

const Auth = () => {
  const { authenticated } = useAppSelector((state: RootState) => state.auth)
  const { error } = useAppSelector((state: RootState) => state.auth)

  if (authenticated) return <Navigate to="/catalog" />

  return (
    <div>
      {error && <Message type="danger" msg={error} />}
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
