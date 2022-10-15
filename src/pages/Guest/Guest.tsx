import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { authInitialState, getUserById } from "../../store/Auth/slice"
import { useAppSelector, RootState } from "../../store/store"
import { User } from "../../store/Auth/types"

const Guest = () => {
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

  const isOpened = foreignUser ? (gotUser.whitelist?.find(u => u.id === user?.id)?.open || false) : true

  return isOpened ? (
    <div className="columns fadeIn is-justify-content-center">
      <div className="column is-flex is-flex-direction-column is-one-fifth is-align-items-center">
        <figure className="image is-128x128">
          <img
            className="is-rounded"
            src={
              gotUser.profileImg ||
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
      <div className="form column is-half">
        <div>{gotUser.firstName}</div>
        <div>{gotUser.lastName}</div>
        <div>{gotUser.email}</div>
      </div>
    </div>
  ) : <h1>User haven't granted you permission to his data</h1>
}

export default Guest
