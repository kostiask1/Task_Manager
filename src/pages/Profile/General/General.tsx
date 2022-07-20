import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth"
import { FormEvent, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import Message from "../../../components/UI/Message"
import {
  uploadDoc,
  uploadImage,
  deleteImage,
} from "../../../firebase/firestore"
import { setError, setSuccess } from "../../../store/actions/authActions"
import { useAppDispatch, useAppSelector, RootState } from "../../../store/store"
import { AuthState, SET_USER, User } from "../../../store/types"
import "./General.scss"

const General = () => {
  const dispatch = useAppDispatch()
  const { user }: AuthState = useAppSelector((state: RootState) => state.auth)
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileImg, setProfileImg] = useState(user?.profileImg || "")
  const [loading, setLoading] = useState(false)
  const { error, success } = useAppSelector((state: RootState) => state.auth)
  const id = user?.id || ""
  const admin = user?.admin || false

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    const auth = getAuth()
    if (error) {
      dispatch(setError(""))
    }

    if (!profileImg.includes("https")) {
      return dispatch(setError("Profile image is not a link"))
    }

    if (user && user.profileImg && user.profileImg !== profileImg) {
      deleteImg(user.profileImg)
    }
    if (auth.currentUser && user) {
      setLoading(true)
      const userData: User = {
        email,
        firstName,
        lastName,
        id,
        admin,
        profileImg,
        password: user.password,
      }
      if (user.email !== email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          user.password
        )
        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
          updateEmail(auth.currentUser as any, email)
        })
      }
      uploadDoc("users", userData)
      dispatch({
        type: SET_USER,
        payload: userData,
      })
      dispatch(setSuccess("Profile updated successfully"))
      setLoading(false)
    }
  }

  const uploadProfileImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && Array.from(files)?.length) {
      setLoading(true)
      uploadImage(files, id + new Date().getTime(), setProfileImg).then(() =>
        setLoading(false)
      )
    }
  }

  const deleteImg = (img: string) => {
    if (profileImg) {
      deleteImage(img).then(() => {
        setLoading(false)
        setProfileImg(profileImg || "")
      })
    }
  }

  return (
    <div className="container">
      <div className="columns is-justify-content-center">
        <form className="form column mt-6  is-half" onSubmit={submitHandler}>
          {error && <Message type="danger" msg={error} />}
          {success && <Message type="success" msg={success} />}
          <Input
            type="text"
            name="firstName"
            minLength={2}
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
            placeholder="set Name"
            label="Name"
            required
          />
          <Input
            type="text"
            name="lastName"
            minLength={2}
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
            placeholder="set Surname"
            label="Surname"
            required
          />
          <Input
            type="text"
            name="profileImg"
            minLength={10}
            value={profileImg}
            onChange={(e) => setProfileImg(e.currentTarget.value)}
            placeholder="set Profile Image"
            label="Profile Image"
            required
          />
          <Input
            type="file"
            name="uploadImg"
            onChange={(e) => uploadProfileImg(e)}
            multiple={false}
            placeholder="upload Profile Image"
            label="Upload Profile Image"
          />
          <Input
            type="email"
            name="in_email"
            value={email}
            minLength={6}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="Email address"
            label="Email address"
            required
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

export default General
