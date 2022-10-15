import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import GuestLinks from "../../components/GuestLinks";
import { authInitialState, getUserById } from "../../store/Auth/slice";
import { User } from "../../store/Auth/types";
import { RootState, useAppSelector } from "../../store/store";

const Guest = () => {
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [gotUser, setGotUser] = useState<User>(authInitialState.user)
  const navigate = useNavigate()

  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid

  useEffect(() => {
    if (!foreignUser) return navigate("/profile")
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
      <div className="column is-half">
        <div>{gotUser.firstName}</div>
        <div>{gotUser.lastName}</div>
        <div><a href={`mailto:${gotUser.email}`}>{gotUser.email}</a></div>
        <GuestLinks uid={uid}/>
      </div>
    </div>
  ) : foreignUser && gotUser.id ? <h1>User haven't granted you permission to his data</h1> : null
}

export default Guest
