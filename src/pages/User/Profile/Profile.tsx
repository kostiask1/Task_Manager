import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail,
  updateProfile,
} from "firebase/auth"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import Prompt from "../../../components/Prompt/Prompt"
import Button from "../../../components/UI/Button"
import Checkbox from "../../../components/UI/Checkbox/Checkbox"
import Input from "../../../components/UI/Input"
import {
  deleteImage,
  uploadDoc,
  uploadImage,
} from "../../../firebase/firestore"
import { equal } from "../../../helpers"
import { useCallbackPrompt } from "../../../hooks/useCallbackPrompt"
import { setError, setSuccess } from "../../../store/App/appSlice"
import { deleteAccount, setUser } from "../../../store/Auth/authSlice"
import { User } from "../../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import "./Profile.scss"

const Profile = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [userData, setUserData] = useState<User>(user)
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const imageNameRef = useRef<HTMLSpanElement>(null)
  const isEqual = useMemo(() => equal(user, userData), [user, userData])
  const [promptDelete, setPromptDelete] = useState<boolean>(false)

  const [promptNavgation, confirmNavigation, cancelNavigation]: any =
    useCallbackPrompt(!isEqual || loading)

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()

    if (!files && !userData.profileImg.includes("https")) {
      return dispatch(setError("Profile image is not a link"))
    }
    if (user) {
      setLoading(true)
      if (files) {
        user.profileImg && deleteImage(user.profileImg)
        uploadImage(files, user.id + new Date().getTime(), "users").then(
          (imageUrl: string) => {
            dispatch(setSuccess("Image updated successfully"))
            setProfileImg(null, imageUrl)
            setFiles(null)
            updateUserProfile(imageUrl)
          }
        )
      } else if (user?.profileImg !== userData.profileImg) {
        user.profileImg && deleteImage(user.profileImg)
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
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
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
      if (imageNameRef.current) {
        imageNameRef.current.innerText = files[0].name
        imageNameRef.current.style.display = "block"
      }
      setTimeout(() => {
        if (imageRef.current) imageRef.current.src = url
      })
    } else {
      if (imageNameRef.current) {
        imageNameRef.current.style.display = "none"
      }
    }
  }, [files])

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    setUserData((state) => ({ ...state, [name]: value }))
  }

  const deleteUser = async () => {
    setLoading(true)
    dispatch(setSuccess("Wait a minute please"))
    await dispatch(deleteAccount(user.id, user.profileImg))
    setLoading(false)
  }

  return (
    <div className="columns fadeIn is-justify-content-center">
      <div className="column is-flex is-flex-direction-column is-one-fifth is-align-items-center">
        <figure className="image is-128x128">
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
        <Button
          onClick={() => setPromptDelete(true)}
          className="is-danger is-fullwidth mt-5"
          text="Delete profile"
        />
      </div>
      <form className="form column is-half" onSubmit={submitHandler}>
        <Input
          type="text"
          name="firstName"
          minLength={2}
          maxLength={20}
          value={userData.firstName}
          onChange={handleChange}
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
          onChange={handleChange}
          placeholder="set Surname"
          label="Surname"
          required
        />
        <Input
          type="text"
          name="profileImg"
          minLength={10}
          value={userData.profileImg}
          onChange={handleChange}
          placeholder="Paste url or download image with button below"
          label="Profile Image"
          required={!files}
        />
        <div className="field">
          <div className="file">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                name="resume"
                onChange={(e) =>
                  e.target.files ? setFiles(e.target.files) : null
                }
                accept="image/*"
                multiple={false}
              />
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fas fa-upload"></i>
                </span>
                <span className="file-label">Choose a file…</span>
              </span>
              <span
                className="file-name"
                style={{ display: "none" }}
                ref={imageNameRef}
              ></span>
            </label>
          </div>
        </div>
        <Input
          type="email"
          name="email"
          value={userData.email}
          minLength={6}
          maxLength={40}
          onChange={handleChange}
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
          disabled={(isEqual && !files) || loading}
        />
      </form>
      <Prompt
        title="If you leave your settings will not be saved!?"
        show={promptNavgation}
        onCancel={cancelNavigation}
        onConfirm={confirmNavigation}
      />
      <Prompt
        title="Delete account?"
        show={promptDelete}
        disabled={loading}
        onCancel={() => setPromptDelete(false)}
        onConfirm={deleteUser}
      />
    </div>
  )
}

export default Profile
