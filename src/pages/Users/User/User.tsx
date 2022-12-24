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

  const isOpen = (id: string, type: "read" | "write") => {
    const index = whitelist.findIndex((user: IWhitelist) => user.id === id)
    return whitelist[index] ? whitelist[index][type] : false
  }

  const openToYou = (foreignUser: IUser, type: "read" | "write") => {
    const you = foreignUser.whitelist.find(u => u.id === currentUser.id)
    const opened = you ? you[type] : false
    return opened
  }

  const WrapUser = ({ children }: any) => {
    const isOpened = user && openToYou(user, "read")

    if (isOpened) {
      return <Link className="is-flex is-align-items-center" to={`/profile/${user.id}`}>{children}</Link>
    } else { return <div className="is-flex is-align-items-center">{children}</div> }
  }

  const toggleOpened = async (e: React.MouseEvent<HTMLButtonElement>, u: IUser, type: "read" | "write") => {
    e.preventDefault()
    const id = u.id
    const wlist: IWhitelist[] = JSON.parse(JSON.stringify(whitelist))
    let index = wlist.findIndex((u: IWhitelist) => u.id === id)

    if (index !== -1) {
      if (type === "read") {
        if (wlist[index].read) {
          wlist[index].read = false
          wlist[index].write = false
        } else {
          wlist[index].read = true
        }
      }
      if (type === "write") {
        if (!wlist[index].write) {
          wlist[index].read = true
          wlist[index].write = true
        }
        else { wlist[index].write = false }
      }
    } else {
      wlist.push({ id, read: true, write: type === "write" })
      index = wlist.length - 1
    }

    await dispatch(updateUser({ ...currentUser, whitelist: wlist }))

    if (wlist[index][type]) {
      dispatch(setSuccess(`User ${u ? `${u.firstName} ${u.lastName}` : id} accessed to ${type}`))
    } else {
      dispatch(setError(`User ${u ? `${u.firstName} ${u.lastName}` : id} denied from ${type}`))
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
      {withControls && <>
        <Button
          onClick={(e) => toggleOpened(e, user, "read")}
          className={"is-small ml-2 " + (isOpen(user.id, "read") ? "is-primary" : "is-danger")}
          style={isMiniMode ? { padding: "0px 4px", height: "auto" } : {}}
          text={isMiniMode ? "r" : "read"} />
        <Button
          onClick={(e) => toggleOpened(e, user, "write")}
          className={"is-small ml-2 " + (isOpen(user.id, "write") ? "is-primary" : "is-danger")}
          style={isMiniMode ? { padding: "0px 4px", height: "auto" } : {}}
          text={isMiniMode ? "w" : "write"} /></>}
    </WrapUser> : null
  );
};

export default User;
