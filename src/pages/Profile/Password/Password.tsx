import { useState, FormEvent } from "react"
import Message from "../../../components/UI/Message"
import { useAppDispatch, useAppSelector, RootState } from "../../../store/store"
import { AuthState, User, SET_USER } from "../../../store/types"
import "./Password.scss"
import Input from "../../../components/UI/Input"
import Button from "../../../components/UI/Button"
import { uploadDoc } from "../../../firebase/firestore"
import { setError, setSuccess } from "../../../store/actions/authActions"
import { getAuth } from "firebase/auth"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth"

const Password = () => {
  const dispatch = useAppDispatch()
  const { user }: AuthState = useAppSelector((state: RootState) => state.auth)
  const { error, success } = useAppSelector((state: RootState) => state.auth)

  const [oldPassword, setOldPassword] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    if (error) {
      dispatch(setError(""))
    }

    const auth = getAuth()

    if (user) {
      if (oldPassword !== user.password) {
        return dispatch(setError("Your Old Password is incorrect."))
      }

      if (password.includes(" ")) {
        return dispatch(setError("Remove all spaces and try again."))
      }

      if (user.password === password) {
        return dispatch(setError("Passwords are equal."))
      }

      if (auth.currentUser && oldPassword === user.password) {
        setLoading(true)
        const userData: User = {
          ...user,
          password,
        }
        const credential = EmailAuthProvider.credential(
          user.email,
          user.password
        )
        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
          uploadDoc("users", userData)
          updatePassword(auth.currentUser as any, password)
          dispatch({
            type: SET_USER,
            payload: userData,
          })
          dispatch(setSuccess("Password updated successfully"))
          setPassword("")
          setOldPassword("")
          setLoading(false)
        })
      }
    }
  }
  console.log("success:", success)
  return (
    <div className="container">
      <div className="columns is-justify-content-center">
        <form className="form column mt-6  is-half" onSubmit={submitHandler}>
          {error && <Message type="danger" msg={error} />}
          {success && <Message type="success" msg={success} />}
          <Input
            type="password"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.currentTarget.value)}
            placeholder="Enter Your Previos Password"
            label="Previos Password"
            minLength={6}
            required
          />
          <Input
            type="password"
            name="in_password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Enter New Password"
            label="New Password"
            minLength={6}
            required
          />
          <Button
            text={loading ? "Loading..." : "Update Password"}
            className="is-primary is-fullwidth mt-5"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  )
}

export default Password
