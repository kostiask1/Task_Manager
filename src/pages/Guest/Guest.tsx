import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { setError, setSuccess } from '../../store/App/slice';
import { authInitialState, getUserById, updateUser } from '../../store/Auth/slice';
import { IUser } from "../../store/Auth/types";
import { RootState, useAppDispatch, useAppSelector } from '../../store/store';

const Guest = () => {
  const dispatch = useAppDispatch()
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const [gotUser, setGotUser] = useState<IUser>(authInitialState.user)

  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid

  useEffect(() => {
    if (!uid) return
      ; (async () => {
        getUserById(uid).then((user) => setGotUser(user))
      })()
  }, [uid, user.id])

  const toggleUserAccess = async () => {
    const newWhitelist = [...user.whitelist]
    const newUserState = { id: gotUser.id, open: !hasUserAccess }
    newWhitelist.splice(newWhitelist.findIndex(u => u.id == gotUser.id), 1, newUserState)
    const updatedProfile: IUser = { ...user, whitelist: newWhitelist }

    await dispatch(updateUser(updatedProfile))

    if (!hasUserAccess) {
      dispatch(setSuccess(`Data OPENED to ${gotUser.firstName} ${gotUser.lastName}`))
    } else {
      dispatch(setError(`Data CLOSED from ${gotUser.firstName} ${gotUser.lastName}`))
    }
  }

  const isOpened = foreignUser ? (gotUser.whitelist?.find(u => u.id === user?.id)?.open || false) : true
  const hasUserAccess = user.whitelist?.find(u => u.id === gotUser?.id)?.open || false

  return isOpened ? (
    <>
      <div className="columns fadeIn is-justify-content-center">
        <div className="column is-flex is-flex-direction-column is-one-fifth is-align-items-center" style={{ width: "auto" }}>
          <figure className="image" style={{ width: 256, aspectRatio: "1/1" }}>
            <img
              className="is-rounded"
              src={
                gotUser.profileImg ||
                "https://bulma.io/images/placeholders/128x128.png"
              }
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
          <div className="is-size-3">{gotUser.firstName} {gotUser.lastName}</div>
          <div><a href={`mailto:${gotUser.email}`}>{gotUser.email}</a></div>
          <button className={`button mt-5 ${hasUserAccess ? "is-success" : "is-danger"}`} onClick={toggleUserAccess}>Access to you: {hasUserAccess ? "GRANTED" : "DENIED"}</button>
        </div>
      </div>
    </>
  ) : foreignUser && gotUser.id ? <h1>User haven't granted you permission to his data</h1> : null
}

export default Guest
