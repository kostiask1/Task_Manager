import { createRef, useCallback, useEffect, useState } from "react"
import Button from "../../components/UI/Button"
import Input from "../../components/UI/Input"
import { setError, setSuccess } from "../../store/App/slice"
import { updateUser } from "../../store/Auth/slice"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { Whitelist as IWhitelist } from "../../store/Wish/types"
import "./Access.scss"

const Access = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [state, setState] = useState<IWhitelist[]>(user.whitelist || [])
  const [userW, setUserW] = useState<string>("")
  const userRef = createRef<HTMLInputElement>()

  useEffect(() => {
    saveWhitelist()
    userRef?.current?.focus()
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
      if (state.findIndex((user) => user.id === userW) > -1) {
        dispatch(setError("User already in whitelist"))
        setUserW("")
      } else {
        if (userW.trim().length == 28) {
          const newUser: IWhitelist = { id: userW, open: true }
          setUserW("")
          setState((state: IWhitelist[]) => [...state, newUser])
          dispatch(setSuccess("User added to whitelist"))
        } else {
          dispatch(setError("Invalid user id"))
        }
      }
    },
    [userW]
  )

  return (
    <>
      <h1 className="is-size-5">
        Grant users access to view your wishlist and tasks
      </h1>
      <hr />
      <ul key={JSON.stringify(state)}>
        {!!state?.length &&
          state.map((user, index) => (
            <li key={user.id + index} className="is-flex is-align-items-center">
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
              <label className="whitelist-text" htmlFor={"checkbox-" + user.id}>
                {user.id}
              </label>
            </li>
          ))}
      </ul>
      <Input
        name="user"
        className="input mt-4"
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
    </>
  )
}

export default Access
