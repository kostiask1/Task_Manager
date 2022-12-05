import { Link } from "react-router-dom";
import Button from "../../../components/UI/Button";
import { setError, setSuccess } from "../../../store/App/slice";
import { getUserById, updateUser } from "../../../store/Auth/slice";
import { IUser } from "../../../store/Auth/types";
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store";
import { Whitelist as IWhitelist } from "../../../store/Wish/types";
import { FC, useEffect, useState } from 'react';

interface UserProps {
  user?: IUser,
  id?: string,
  mode?: "mini" | "full",
  withControls?: boolean
}

const User: FC<UserProps> = ({ user: u, id, withControls = false, mode = "full" }) => {
  const dispatch = useAppDispatch()
  const [user, setUser] = useState<IUser | undefined>(u)
  const currentUser: IUser = useAppSelector((state: RootState) => state.auth.user)
  const whitelist: IWhitelist[] = currentUser.whitelist || []

  useEffect(() => {
    if (id) {
      getUserById(id).then((user: IUser) => setUser(user))
    }
  }, [id])

  const isOpen = (id: string) => {
    const index = whitelist.findIndex((user: IWhitelist) => user.id === id)
    return whitelist[index]?.open || false
  }

  const openToYou = (foreignUser: IUser) => {
    const you = foreignUser.whitelist.find(u => u.id === currentUser.id)
    const opened = you?.open || false
    return opened
  }

  const WrapUser = ({ children }: any) => {
    const isOpened = user && openToYou(user)

    if (isOpened) {
      return <Link className="is-flex is-align-items-center" to={`/profile/${user.id}`}>{children}</Link>
    } else { return <div className="is-flex is-align-items-center">{children}</div> }
  }

  const toggleOpened = async (e: React.MouseEvent<HTMLButtonElement>, u: IUser) => {
    e.preventDefault()
    const id = u.id
    const wlist = JSON.parse(JSON.stringify(whitelist))
    let index = wlist.findIndex((u: IWhitelist) => u.id === id)

    if (index !== -1) {
      wlist[index].open = !wlist[index].open
    } else {
      wlist.push({ id, open: true })
      index = wlist.length - 1
    }

    await dispatch(updateUser({ ...currentUser, whitelist: wlist }))

    if (wlist[index].open) {
      dispatch(setSuccess(`Data OPENED to ${u ? `${u.firstName} ${u.lastName}` : id}`))
    } else {
      dispatch(setError(`Data CLOSED from ${u ? `${u.firstName} ${u.lastName}` : id}`))
    }
  }

  const isMiniMode = mode === "mini"

  return (
    user ? <WrapUser>
      {mode === "full" && <figure className="image mx-2 is-48x48 is-inline-block">
        <img
          className="is-rounded"
          src={
            user.profileImg ||
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
      </figure>}
      <span>{user.firstName} {user.lastName}</span>
      {withControls &&
        <Button
          onClick={(e) => toggleOpened(e, user)}
          className={"is-small ml-2 " + (isOpen(user.id) ? "is-primary" : "is-danger")}
          style={isMiniMode ? { padding: "0px 4px", height: "auto" } : {}}
          text={isOpen(user.id) ? (isMiniMode ? "✓" : "Accessed") : (isMiniMode ? "x" : "Closed")} />}
    </WrapUser> : null
  );
};

export default User;
