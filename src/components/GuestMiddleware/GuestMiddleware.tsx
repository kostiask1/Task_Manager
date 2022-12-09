import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setError, setSuccess } from "../../store/App/slice";
import { authInitialState, getUserById } from "../../store/Auth/slice";
import { IUser } from "../../store/Auth/types";
import { RootState, useAppDispatch, useAppSelector } from "../../store/store";
import GuestLinks from '../GuestLinks/GuestLinks';
import Button from "../UI/Button";

type ISecurityProps = {
  fallback?: string,
}

const GuestMiddleware: FC<ISecurityProps> = ({ fallback }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const [gotUser, setGotUser] = useState<IUser>(authInitialState.user)
  const [uid, setUid] = useState("")

  const foreignUser = uid !== undefined && user.id !== uid

  useEffect(() => {
    const id = locationUserId()
    setUid(id)
  }, [location.pathname, user.id])

  const locationUserId = () => {
    const route = window.location.pathname
    const pathname = route.split("/")
    const id = pathname[pathname.length - 1]
    const hasId = id.length === 28

    if (hasId) return id
    return user.id
  }

  useEffect(() => {
    if (!foreignUser) return
      ; (async () => {
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

  const isOpened = foreignUser ? (gotUser.whitelist?.find(u => u.id === user?.id)?.open || false) : true

  const goToUser = useCallback(() => {
    navigate(`/profile/${uid}`);
  }, [user.id])

  return (
    <div className="container mt-5">
      {!foreignUser && (
        <Button
          onClick={copyPage}
          className="is-primary"
          text="Share Your Data"
        />
      )}
      {foreignUser && isOpened && (
        <h2 className="is-flex is-align-items-center is-justify-content-center">
          <div
            className="user is-inline-flex is-align-items-center mr-3"
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={goToUser}
          >
            <figure className="image mx-2 is-48x48 is-inline-block">
              <img
                className="is-rounded"
                src={
                  gotUser?.profileImg ||
                  "https://bulma.io/images/placeholders/128x128.png"
                }
                style={{ maxHeight: "48px" }}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null
                  currentTarget.src =
                    "https://bulma.io/images/placeholders/128x128.png"
                }}
                alt="Profile img"
              />
            </figure>
            <span>
              {gotUser.id ? `${gotUser.firstName} ${gotUser.lastName}` : uid}
            </span>
          </div>
          <GuestLinks uid={uid} />
        </h2>
      )}
      {foreignUser && gotUser.id && !isOpened && <h1>{fallback ?? "User haven't granted you permission to his data"}</h1>}
      {isOpened && (
        <>
          <hr className="my-3" />
        </>)
      }
    </div>
  )
}

export default GuestMiddleware
