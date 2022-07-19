import "./Auth.scss"
import SignIn from "./SignIn"
import SignUp from "./SignUp"

const Auth = () => {
  return (
    <div className="columns">
      <div className="column">
        <SignIn />
      </div>
      <div className="column">
        <SignUp />
      </div>
    </div>
  )
}

export default Auth
