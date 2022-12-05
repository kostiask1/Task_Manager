import { useEffect, useState } from "react";
import Input from "../../components/UI/Input";
import { getAllUsers } from '../../store/Auth/slice';
import { IUser } from "../../store/Auth/types";
import { RootState, useAppSelector } from "../../store/store";
import User from './User/User';

const Access = () => {
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const [search, setSearch] = useState<string>("")
  const [users, setUsers] = useState<IUser[]>([])
  const [filteredList, setFilteredList] = useState<IUser[]>([])

  useEffect(() => {
    getAllUsers().then((users: IUser[]) => {
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

  return (
    <div className="section is-medium pt-2 pb-6">
      <h1 className="is-size-5">
        List of users
      </h1>
      <hr className="my-2" />
      <Input
        name="user"
        className="input mt-2"
        placeholder="Start typing user Name, Surname or id (Expecting 28 characters)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        list="users_ids"
      />
      <hr />
      {
        filteredList.map((user, index) => (
          <li key={user.id + index} className="is-flex mb-3 is-align-items-center">
            <div className="whitelist-text is-flex is-align-items-center">
              <User user={user} withControls={true} />
            </div>
          </li>
        ))}
    </div>
  )
}

export default Access
