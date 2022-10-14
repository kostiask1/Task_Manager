import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { setError, setSuccess } from "../../store/App/slice"
import { getUserById } from "../../store/Auth/slice"
import { User } from "../../store/Auth/types"
import { authInitialState } from "../../store/Auth/slice"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import Button from "../UI/Button"

const Guest = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [gotUser, setGotUser] = useState<User>(authInitialState.user)
  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid

  useEffect(() => {
    if (!foreignUser) return
    ;(async () => {
      getUserById(uid).then((user) => setGotUser(user))
    })()
  }, [user.id])

  const copyPage = useCallback(() => {
    navigator.clipboard
      .writeText(
        `${window.location.host}${window.location.pathname}/${user.id}`
      )
      .then(
        () =>
          dispatch(
            setSuccess("Link to your current data page is copied to clipboard")
          ),
        () => dispatch(setError("Something went wrong"))
      )
  }, [user.id])

  const copyUserId = useCallback(() => {
    uid &&
      navigator.clipboard.writeText(uid).then(
        () => dispatch(setSuccess("Link to user is copied to clipboard")),
        () => dispatch(setError("Something went wrong"))
      )
  }, [user.id])

  return (
    <>
      {!foreignUser && (
        <Button
          onClick={copyPage}
          className="is-primary"
          text="Share Your Data"
        />
      )}
      {uid && uid !== user.id && (
        <h2>
          Data of user:{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={copyUserId}
          >
            {gotUser.id ? `${gotUser.firstName} ${gotUser.lastName}` : uid}
          </span>
        </h2>
      )}
      <hr className="my-3" />
    </>
  )
}

export default Guest
