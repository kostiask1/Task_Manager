import { createRef, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Input from "../../components/UI/Input";
import { setError, setSuccess } from "../../store/App/slice";
import { getAllUsers, updateUser } from '../../store/Auth/slice';
import { User } from "../../store/Auth/types";
import { RootState, useAppDispatch, useAppSelector } from "../../store/store";
import { Whitelist as IWhitelist } from "../../store/Wish/types";
import Button from '../../components/UI/Button';

const Access = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const whitelist: IWhitelist[] = user.whitelist || []
  const [search, setSearch] = useState<string>("")
  const [users, setUsers] = useState<User[]>([])
  const [filteredList, setFilteredList] = useState<User[]>([])
  const userRef = createRef<HTMLInputElement>()

  useEffect(() => {
    getAllUsers().then((users: User[]) => {
      const filteredList = users.filter(u => (u.id !== user.id))
      setUsers(filteredList)
      setFilteredList(filteredList)
    })
  }, [])

  useEffect(() => {
    if (!search) return setFilteredList(users)
    const filteredList = users.filter(user => (user.firstName.includes(search)) || (user.lastName.includes(search)) || (user.id === search))
    setFilteredList(filteredList)
  }, [search])

  const toggleOpened = async (e: React.MouseEvent<HTMLButtonElement>, user: User) => {
    e.preventDefault()
    const id = user.id
    const wlist = JSON.parse(JSON.stringify(whitelist))
    let index = wlist.findIndex((user: IWhitelist) => user.id === id)

    if (index !== -1) {
      wlist[index].open = !wlist[index].open
    } else {
      wlist.push({ id, open: true })
      index = wlist.length - 1
    }

    await dispatch(updateUser({ ...user, whitelist: wlist }))

    if (wlist[index].open) {
      dispatch(setSuccess(`Data OPENED to ${user ? `${user.firstName} ${user.lastName}` : id}`))
    } else {
      dispatch(setError(`Data CLOSED from ${user ? `${user.firstName} ${user.lastName}` : id}`))
    }
  }

  const isOpen = (id: string) => {
    const index = whitelist.findIndex((user: IWhitelist) => user.id === id)
    return whitelist[index]?.open || false
  }

  const openToYou = (foreignUser: User) => {
    const you = foreignUser.whitelist.find(u => u.id === user.id)
    const opened = you?.open || false
    return opened
  }

  const WrapUser = ({ user, children }: any) => {
    const isOpened = openToYou(user)

    if (isOpened) {
      return <Link className="is-flex is-align-items-center" to={`/profile/${user.id}`}>{children}</Link>
    } else { return <div className="is-flex is-align-items-center">{children}</div> }
  }

  return (
    <div className="section is-medium pt-2 pb-6">
      <h1 className="is-size-5">
        Grant users access to view your data
      </h1>
      <hr className="my-2" />
      <Input
        name="user"
        className="input mt-2"
        placeholder="start typing user Name, Surname or id (Expecting 28 characters)"
        value={search}
        ref={userRef}
        onChange={(e) => setSearch(e.target.value)}
        list="users_ids"
      />
      <hr />
      {
        filteredList.map((user, index) => (
          <li key={user.id + index} className="is-flex mb-3 is-align-items-center">
            <div className="whitelist-text is-flex is-align-items-center">
              <WrapUser user={user}>
                <figure className="image mx-2 is-48x48 is-inline-block">
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
                </figure>
                <span>{user.firstName} {user.lastName}</span>
              </WrapUser>
              <Button
                onClick={(e) => toggleOpened(e, user)}
                className={"is-small ml-2 " + (isOpen(user.id) ? "is-primary" : "is-danger")}
                text={isOpen(user.id) ? "Accessed" : "Closed"} />
            </div>
          </li>
        ))}
    </div>
  )
}

export default Access
