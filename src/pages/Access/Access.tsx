import { createRef, useCallback, useEffect, useState } from "react"
import Button from "../../components/UI/Button"
import Input from "../../components/UI/Input"
import { setError, setSuccess } from "../../store/App/slice"
import { updateUser, getUserById } from '../../store/Auth/slice';
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { Whitelist as IWhitelist } from "../../store/Wish/types"
import { Link } from 'react-router-dom';

const Access = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [state, setState] = useState<IWhitelist[]>(user.whitelist || [])
  const [userW, setUserW] = useState<string>("")
  const [users, setUsers] = useState<User[]>([])
  const userRef = createRef<HTMLInputElement>()

  useEffect(() => {
    saveWhitelist()
    userRef?.current?.focus()
  }, [state])

  useEffect(() => {
    if (state.length === 0) return
    Promise.all(state.map(user => getUserById(user.id))).then((gotUsers) => setUsers(gotUsers))
  }, [state])

  const removeUser = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    const copy = [...state]
    const index = copy.findIndex((user: IWhitelist) => user.id === id)
    copy.splice(index, 1)
    setState(copy)
  }
  const toggleOpened = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.preventDefault()
    const copy = JSON.parse(JSON.stringify(state))
    const index = copy.findIndex((user: IWhitelist) => user.id === id)
    copy[index].open = !copy[index].open
    const user = users.find(u => u.id === id)
    
    if (copy[index].open) {
      dispatch(setSuccess(`Data OPENED to ${user ? `${user.firstName} ${user.lastName}` : id}`))
    } else {
      dispatch(setError(`Data CLOSED from ${user ? `${user.firstName} ${user.lastName}` : id}`))
    }
    setState(copy)
  }

  const handleWhitelist = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.value.trim().length <= 28 && setUserW(e.target.value.trim())

  const saveWhitelist = async () => {
    const updatedProfile: User = { ...user, whitelist: state }
    await dispatch(updateUser(updatedProfile))
  }

  const addUserToWhitelist = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (user.id === userW.trim()) {
        dispatch(setError("You can't add yourself to whitelist"))
        setUserW("")
        return
      }

      if (state.findIndex((user) => user.id === userW) > -1) {
        dispatch(setError("User already in whitelist"))
        return setUserW("")
      }

      if (userW.trim().length == 28) {
        getUserById(userW.trim()).then(user => {
          if (user) {
            setUserW("")
            const newUser: IWhitelist = { id: userW, open: true }
            setState((state: IWhitelist[]) => [...state, newUser])
            return dispatch(setSuccess("User added to whitelist"))
          }
          dispatch(setError("There's no user with such ID"))
        })
      } else {
        dispatch(setError("Invalid user id"))
      }
    },
    [userW]
  )
  
  return (
    <div className="section is-medium pt-2 pb-6">
      <h1 className="is-size-5">
        Grant users access to view your data
      </h1>
      <hr className="my-2" />
      <ul key={JSON.stringify(state)}>
        {!!state?.length &&
          state.map((user, index) => (
            <li key={user.id + index} className="is-flex mb-3 is-align-items-center">
              <input
                type="checkbox"
                className="checkbox"
                id={"checkbox-" + user.id}
                checked={user.open}
                onChange={(e) => toggleOpened(e, user.id)}
              />
              <Button
                className="is-danger mx-2 is-small"
                style={{ height: 16, padding: "0px 4px" }}
                onClick={(e) => removeUser(e, user.id)}
                text="x"
              />
              <label className="whitelist-text is-flex is-align-items-center" htmlFor={"checkbox-" + user.id}>
                {users[index] ?
                  <>
                    <figure className="image mx-2 is-48x48 is-inline-block">
                      <img
                        className="is-rounded"
                        src={
                          users[index].profileImg ||
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
                    <Link to={`/profile/${user.id}`}>{users[index].firstName} {users[index].lastName}</Link>
                    <div className="ml-1 is-size-7 id-line">({user.id})</div>
                  </> : <span className="id-line">{user.id}</span>}
              </label>
            </li>
          ))}
      </ul>
      <Input
        name="user"
        className="input mt-2"
        placeholder="Enter user id (Expecting 28 characters)"
        value={userW}
        ref={userRef}
        onChange={handleWhitelist}
        list="users_ids"
      />
      <Button
        onClick={addUserToWhitelist}
        className={`add-user ${userW.trim().length !== 28 ? "" : "is-info"}`}
        text="Add user"
        disabled={userW.trim().length !== 28}
      />
    </div>
  )
}

export default Access
