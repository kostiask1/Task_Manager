import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updateEmail,
  updateProfile,
} from "firebase/auth"
import { FormEvent, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import {
  deleteImage,
  uploadDoc,
  uploadImage,
} from "../../../firebase/firestore"
import { setError, setSuccess } from "../../../store/appSlice"
import { setUser } from "../../../store/authSlice"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { User } from "../../../store/types"
import "./General.scss"
import Checkbox from "../../../components/UI/Checkbox/Checkbox"

const General = () => {
  const dispatch = useAppDispatch()
  const user: User | null = useAppSelector(
    (state: RootState) => state.auth.user
  )
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileImg, setProfileImg] = useState(user?.profileImg || "")
  const [loading, setLoading] = useState(false)
  const id = user?.id || ""
  const admin = user?.admin || false

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    const auth = getAuth()

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
        emailVerified: auth.currentUser.emailVerified,
      }
      updateProfile(auth.currentUser, {
        displayName: firstName,
        photoURL: profileImg,
      })
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
      dispatch(setUser(userData))
      dispatch(setSuccess("Profile updated successfully"))
      setLoading(false)
    }
  }

  const uploadProfileImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && Array.from(files)?.length) {
      setLoading(true)
      uploadImage(
        files,
        id + new Date().getTime(),
        "users",
        setProfileImg
      ).then(() => setLoading(false))
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
    <div className="columns is-justify-content-center">
      <form className="form column is-half" onSubmit={submitHandler}>
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
        <Checkbox
          text="Email verificated"
          disabled={true}
          checked={user.emailVerified}
        />
        <Button
          text={loading ? "Loading..." : "Update Profile"}
          className="is-primary is-fullwidth mt-5"
          disabled={loading}
        />
      </form>
    </div>
  )
}

export default General
