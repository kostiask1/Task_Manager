import { useCallback, useEffect, useState, FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { setError, setSuccess } from "../../store/App/slice";
import { authInitialState, getUserById } from "../../store/Auth/slice";
import { User } from "../../store/Auth/types";
import { RootState, useAppDispatch, useAppSelector } from "../../store/store";
import Button from "../UI/Button";

type ISecurityProps = {
  data?: string,
  fallback?: string,
  children?: React.ReactNode
}

const SecurityMiddleware: FC<ISecurityProps> = ({ fallback, data, children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [gotUser, setGotUser] = useState<User>(authInitialState.user)
  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid

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
    <>
      {!foreignUser && (
        <Button
          onClick={copyPage}
          className="is-primary"
          text="Share Your Data"
        />
      )}
      {foreignUser && isOpened && (
        <h2 className="is-inline-flex is-align-items-center">
          <div
            className="user is-inline-flex is-align-items-center"
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
          <span>: {data ?? "Data"}</span>
        </h2>
      )}
      {foreignUser && gotUser.id && !isOpened && <h1>{fallback ?? "User haven't granted you permission to his data"}</h1>}
      {isOpened && (
        <>
          <hr className="my-3" />
          {children}
        </>)
      }
    </>
  )
}

export default SecurityMiddleware
