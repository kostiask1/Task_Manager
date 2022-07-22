import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updateEmail,
  updateProfile,
} from "firebase/auth"
import { FormEvent, useState, useEffect, useRef } from "react"
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
  const [files, setFiles] = useState<FileList>()
  const [loading, setLoading] = useState(false)
  const id = user?.id || ""
  const admin = user?.admin || false
  const imageRef = useRef<HTMLImageElement>(null)

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()

    if (!files && !profileImg.includes("https")) {
      return dispatch(setError("Profile image is not a link"))
    }

    if (
      user &&
      ((user.profileImg && user.profileImg !== profileImg) || files)
    ) {
      setLoading(true)
      if (files) {
        uploadImage(files, id + new Date().getTime(), "users").then(
          (imageUrl: any) => {
            dispatch(setSuccess("Image updated successfully"))
            setProfileImg(imageUrl)
            update(imageUrl)
          }
        )
      } else {
        update()
      }
      deleteImg(user.profileImg)
    } else {
      update()
    }
  }

  const update = (image?: string) => {
    const auth = getAuth()
    if (auth.currentUser && user) {
      setLoading(true)
      const userData: User = {
        email,
        firstName,
        lastName,
        id,
        admin,
        profileImg: image || profileImg,
        password: user.password,
        emailVerified: auth.currentUser.emailVerified,
      }
      updateProfile(auth.currentUser, {
        displayName: firstName,
        photoURL: profileImg,
      })
      uploadDoc("users", userData)
      dispatch(setUser(userData))
      dispatch(setSuccess("Profile updated successfully"))
      setLoading(false)
      if (user.email !== email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          user.password
        )
        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
          updateEmail(auth.currentUser as any, email)
        })
      }
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (files && Array.from(files)?.length) {
      const url = URL.createObjectURL(files[0])
      if (imageRef.current) imageRef.current.src = url
    }
  }, [files])

  const uploadProfileImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files)
    }
  }

  const deleteImg = (img: string) => {
    if (profileImg) {
      deleteImage(img).then(() => {
        setLoading(false)
        if (imageRef.current) imageRef.current.src = profileImg
      })
    }
  }

  return (
    <div className="columns is-justify-content-center">
      <div className="column is-one-fifth">
        <figure className="image ml-1 is-128x128">
          <img
            ref={imageRef}
            className="is-rounded"
            src={
              profileImg || "https://bulma.io/images/placeholders/128x128.png"
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
          maxLength={30}
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
          value={email}
          minLength={6}
          maxLength={40}
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
