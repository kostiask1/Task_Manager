import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth"
import { FormEvent, useState } from "react"
import Button from "../../components/UI/Button"
import Input from "../../components/UI/Input"
import Message from "../../components/UI/Message"
import { uploadDoc } from "../../firebase/firestore"
import { setError } from "../../store/actions/authActions"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { AuthState, SET_USER, User } from "../../store/types"
import "./Profile.scss"

const Profile = () => {
  const dispatch = useAppDispatch()
  const { user }: AuthState = useAppSelector((state: RootState) => state.auth)
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileImg, setProfileImg] = useState(user?.profileImg || "")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { error } = useAppSelector((state: RootState) => state.auth)
  const id = user?.id || ""
  const admin = user?.admin || false

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    const auth = getAuth()
    if (error) {
      dispatch(setError(""))
    }
    setLoading(true)
    const userData: User = {
      email,
      firstName,
      lastName,
      id,
      admin,
      profileImg,
      password,
    }
    uploadDoc("users", userData)
    if (auth.currentUser) {
    }
    console.log("user:", user)
    if (auth.currentUser && user) {
      const credential = EmailAuthProvider.credential(user.email, user.password)
      reauthenticateWithCredential(auth.currentUser, credential).then(
        (resp) => {
          console.log(resp)
          updateEmail(auth.currentUser as any, email)
        }
      )
    }
    dispatch({
      type: SET_USER,
      payload: userData,
    })
    setLoading(false)
  }

  return (
    <div className="container">
      <div className="columns is-justify-content-center">
        <form className="form column mt-6  is-half" onSubmit={submitHandler}>
          {error && <Message type="danger" msg={error} />}
          <Input
            type="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
            placeholder="set Name"
            label="Name"
          />
          <Input
            type="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
            placeholder="set Surname"
            label="Surname"
          />
          <Input
            type="profileImg"
            name="profileImg"
            value={profileImg}
            onChange={(e) => setProfileImg(e.currentTarget.value)}
            placeholder="set Profile Image"
            label="Profile Image"
          />
          <Input
            type="email"
            name="in_email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="Email address"
            label="Email address"
          />
          <Input
            type="password"
            name="in_password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
            label="Password"
          />
          <Button
            text={loading ? "Loading..." : "Update Profile"}
            className="is-primary is-fullwidth mt-5"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  )
}

export default Profile
