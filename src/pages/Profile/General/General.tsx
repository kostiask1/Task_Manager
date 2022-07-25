import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail,
  updateProfile,
} from "firebase/auth"
import { FormEvent, useEffect, useRef, useState } from "react"
import Button from "../../../components/UI/Button"
import Checkbox from "../../../components/UI/Checkbox/Checkbox"
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
import { equal } from "../../../helpers"

const General = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [userData, setUserData] = useState<User>(user)
  const [files, setFiles] = useState<FileList>()
  const [loading, setLoading] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()

    if (!files && !userData.profileImg.includes("https")) {
      return dispatch(setError("Profile image is not a link"))
    }
    if (user) {
      setLoading(true)
      if (files) {
        deleteImage(user.profileImg)
        uploadImage(files, user.id + new Date().getTime(), "users").then(
          (imageUrl: any) => {
            dispatch(setSuccess("Image updated successfully"))
            setProfileImg(null, imageUrl)
            updateUserProfile(imageUrl)
          }
        )
      } else if (user?.profileImg !== userData.profileImg) {
        deleteImage(user.profileImg)
        updateUserProfile()
      } else {
        updateUserProfile()
      }
    }
  }

  const updateUserProfile = async (image?: string) => {
    const auth = getAuth()
    if (auth.currentUser) {
      const updatedProfile: User = {
        ...userData,
        profileImg: image || userData.profileImg,
        emailVerified:
          user.email !== userData.email ? false : user.emailVerified,
      }
      updateProfile(auth.currentUser, {
        displayName: updatedProfile.firstName,
        photoURL: updatedProfile.profileImg,
      })
      await uploadDoc("users", updatedProfile)
      dispatch(setUser(updatedProfile))
      dispatch(setSuccess("Profile updated successfully"))
      setLoading(false)
      if (user.email !== updatedProfile.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          user.password
        )
        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
          updateEmail(auth.currentUser as any, updatedProfile.email).then(
            () => {
              sendEmailVerification(auth.currentUser as any).then(() => {
                setUserData((state) => ({ ...state, emailVerified: false }))
                dispatch(setError("Check your email to verify your account!"))
              })
            }
          )
        })
      }
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (files && Array.from(files)?.length) {
      const url = URL.createObjectURL(files[0])
      setProfileImg()
      setTimeout(() => {
        if (imageRef.current) imageRef.current.src = url
      })
    }
  }, [files])

  const setFirstName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserData((state): User => ({ ...state, firstName: e.target.value }))

  const setLastName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserData((state): User => ({ ...state, lastName: e.target.value }))

  const setProfileImg = (
    e?: React.ChangeEvent<HTMLInputElement> | null,
    value?: string
  ) =>
    setUserData(
      (state): User => ({
        ...state,
        profileImg: e?.target.value || value || "",
      })
    )

  const setEmail = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserData((state): User => ({ ...state, email: e.target.value }))

  const uploadProfileImg = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.files && setFiles(e.target.files)

  return (
    <div className="columns is-justify-content-center">
      <div className="column is-one-fifth">
        <figure className="image ml-1 is-128x128">
          <img
            ref={imageRef}
            className="is-rounded"
            src={
              userData.profileImg ||
              "https://bulma.io/images/placeholders/128x128.png"
            }
            style={{ maxHeight: "128px" }}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src =
                "https://bulma.io/images/placeholders/128x128.png"
            }}
            alt="Profile img"
          />
        </figure>
      </div>
      <form className="form column is-half" onSubmit={submitHandler}>
        <Input
          type="text"
          name="firstName"
          minLength={2}
          maxLength={20}
          value={userData.firstName}
          onChange={(e) => setFirstName(e)}
          placeholder="set Name"
          label="Name"
          required
        />
        <Input
          type="text"
          name="lastName"
          minLength={2}
          maxLength={30}
          value={userData.lastName}
          onChange={(e) => setLastName(e)}
          placeholder="set Surname"
          label="Surname"
          required
        />
        <Input
          type="text"
          name="profileImg"
          minLength={10}
          value={userData.profileImg}
          onChange={(e) => setProfileImg(e)}
          placeholder="set Profile Image"
          label="Profile Image"
          required={!files}
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
          value={userData.email}
          minLength={6}
          maxLength={40}
          onChange={(e) => setEmail(e)}
          placeholder="Email address"
          label="Email address"
          required
        />
        <Checkbox
          text="Email verificated"
          disabled={true}
          checked={userData.emailVerified}
        />
        <Button
          text={loading ? "Loading..." : "Update Profile"}
          className="is-primary is-fullwidth mt-5"
          disabled={equal(user, userData) || loading}
        />
      </form>
    </div>
  )
}

export default General
