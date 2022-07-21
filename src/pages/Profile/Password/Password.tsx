import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth"
import { FormEvent, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { uploadDoc } from "../../../firebase/firestore"
import { setError, setSuccess } from "../../../store/actions/authActions"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { SET_USER, User } from "../../../store/types"
import "./Password.scss"

const Password = () => {
  const dispatch = useAppDispatch()
  const user: User | null = useAppSelector(
    (state: RootState) => state.auth.user
  )
  const error = useAppSelector((state: RootState) => state.auth.error)
  const [oldPassword, setOldPassword] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()

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

  return (
    <div className="columns is-justify-content-center">
      <form className="form column is-half" onSubmit={submitHandler}>
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
  )
}

export default Password
