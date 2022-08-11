import { useCallback, useMemo, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import Textarea from "../../../components/UI/Textarea"
import { equal } from "../../../helpers"
import { setError, setSuccess } from "../../../store/App/slice"
import { User } from "../../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import {
  deleteWish,
  editingWish,
  setWish,
  wishInitialState,
} from "../../../store/Wish/slice"
import {
  Whitelist as IWhitelist,
  Wish as IWish,
} from "../../../store/Wish/types"
import Whitelist from "../Whitelist"
import "./WishForm.scss"

const WishForm = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const wish: IWish | null = useAppSelector(
    (state: RootState) => state.wishes.editingWish
  )
  const wishes: IWish[] = useAppSelector(
    (state: RootState) => state.wishes.array
  )
  const [state, setState] = useState<IWish>(wish || wishInitialState)
  const [loadingSave, setLoadingSave] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [userW, setUser] = useState<string>("")

  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

  const [categories, users_in_whitelist] = useMemo(() => {
    const categories: string[] = []
    const users_ids: string[] = []
    for (let i = 0; i < wishes.length; i++) {
      const wish = wishes[i]
      if (wish.whitelist?.length) {
        for (let j = 0; j < wish.whitelist.length; j++) {
          const user = wish.whitelist[j]
          if (
            !users_ids.includes(user.id) &&
            state.whitelist.findIndex((u) => u.id === user.id) === -1
          ) {
            users_ids.push(user.id)
          }
        }
      }
      if (wish.category) {
        if (!categories.includes(wish.category)) {
          categories.push(wish.category)
        }
      }
    }
    return [categories, users_ids]
  }, [wishes, state.whitelist])

  const clear = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    dispatch(editingWish(wishInitialState))
    setState(wishInitialState)
  }

  const reset = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setState(wish || wishInitialState)
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name
    const value = event.target.value
    setState((state: IWish) => ({ ...state, [name]: value }))
  }
  const handleOpen = () =>
    setState((state: IWish) => ({ ...state, open: !state.open }))

  const addWishToUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const saveWish: IWish = { ...state }
      setLoadingSave(true)
      if (!isEdit) saveWish.id = new Date().getTime()
      saveWish.title = saveWish.title.trim()
      saveWish.description = saveWish.description.trim()
      saveWish.uid = user.id
      await dispatch(setWish(saveWish))
      setLoadingSave(false)
      isEdit
        ? dispatch(setSuccess("Wish updated successfully"))
        : dispatch(setSuccess("Wish created successfully"))
      clear()
    },
    [state]
  )

  const deleteW = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setDeleting(true)
      await dispatch(deleteWish(state))
      dispatch(editingWish(wishInitialState))
      setDeleting(false)
      dispatch(setSuccess("Wish deleted successfully"))
    },
    [state]
  )

  const addUserToWhitelist = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (state.whitelist.findIndex((user) => user.id === userW) > -1) {
        dispatch(setError("User already in whitelist"))
        setUser("")
      } else {
        if (userW.trim().length == 28) {
          const newUser: IWhitelist = { id: userW, open: true }
          setUser("")
          setState((state: IWish) => ({
            ...state,
            whitelist: [...state.whitelist, newUser],
          }))
        } else {
          dispatch(setError("Invalid user id"))
        }
      }
    },
    [userW]
  )
  const handleWhitelist = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.value.trim().length <= 28 && setUser(e.target.value.trim())
  return (
    <form className="card wish fadeIn" key={state.id} onSubmit={addWishToUser}>
      <header className="card-header">
        <div className="card-header-title is-align-items-center">
          <label htmlFor="title">{stateName} Wish -</label>
          <Input
            name="title"
            className="ml-2 input"
            value={state.title}
            onChange={handleChange}
            maxLength={75}
            minLength={3}
            required
          />
        </div>
      </header>
      <div className="card-content">
        <Textarea
          name="description"
          label="Description"
          value={state.description}
          maxLength={750}
          onChange={handleChange}
        />
        <div className="columns mb-0">
          <div className="column mb-0">
            <Input
              name="category"
              label="Category"
              list="categories"
              value={state.category}
              onChange={handleChange}
              maxLength={30}
            />
            <datalist id="categories">
              {!!categories.length &&
                categories.map((category) => (
                  <option value={category} key={category}></option>
                ))}
            </datalist>
          </div>
          <div className="column mb-0">
            <Input
              type="number"
              name="price"
              label="Price"
              min={0}
              value={state.price || ""}
              onChange={handleChange}
            />
          </div>
          <div className="column mb-0">
            <Input
              name="url"
              label="Url"
              value={state.url}
              onChange={handleChange}
              maxLength={300}
            />
          </div>
        </div>
        <div className="is-flex is-align-items-center mb-5">
          <label htmlFor="open">Open</label>
          <input
            type="checkbox"
            name="open"
            id="open"
            className="mx-2"
            checked={state.open}
            value={+state.open}
            onChange={handleOpen}
          />
          <label htmlFor="open">
            (
            {state.open
              ? "Any user can view this wish"
              : "WIsh will be visible to users in whitelist only"}
            )
          </label>
        </div>
        <label htmlFor="user">
          {state.open ? (
            <del>
              <b>Whitelist (IDs of users that can view this wish)</b>
            </del>
          ) : (
            <b>Whitelist (IDs of users that can view this wish)</b>
          )}
        </label>
        <hr style={{ margin: "5px 0" }} />
        <ul key={JSON.stringify(state.whitelist)}>
          {!!state.whitelist?.length &&
            state.whitelist.map((user, index) => (
              <Whitelist
                key={user.id + index}
                data={user}
                wish={state}
                editable={!state.open}
                update={(data) =>
                  setState((state: IWish) => ({ ...state, whitelist: data }))
                }
              />
            ))}
        </ul>
        <Input
          name="user"
          className="input mt-4"
          placeholder="Enter user id to grant him/her access to view this wish"
          value={userW}
          onChange={handleWhitelist}
          disabled={state.open}
          list="users_ids"
        />
        <datalist id="users_ids">
          {!!users_in_whitelist.length &&
            users_in_whitelist.map((id) => (
              <option key={id} value={id}></option>
            ))}
        </datalist>
        <Button
          onClick={addUserToWhitelist}
          className="add-user is-info"
          text="Add user"
          disabled={
            loadingSave || deleting || !userW.trim().length || state.open
          }
        />
      </div>
      <footer className="card-footer p-3">
        <div className="buttons">
          {isEdit ? (
            <Button
              className="mx-2 card-footer-item is-success"
              text={loadingSave ? "Updating..." : "Update"}
              disabled={loadingSave || deleting || equal(state, wish)}
            />
          ) : (
            <Button
              className="mx-2 card-footer-item is-success"
              text={loadingSave ? "Saving..." : "Save"}
              disabled={
                loadingSave || deleting || equal(state, wishInitialState)
              }
            />
          )}
          {isEdit && (
            <Button
              className="mx-2 card-footer-item is-danger"
              text={deleting ? "Deleting..." : "Delete"}
              onClick={deleteW}
              disabled={loadingSave || deleting}
            />
          )}
          {isEdit ? (
            <Button
              onClick={clear}
              className="mx-2 card-footer-item is-warning"
              text="Clear"
              disabled={loadingSave || deleting}
            />
          ) : (
            <Button
              onClick={reset}
              className="mx-2 card-footer-item is-warning"
              text="Reset"
              disabled={
                loadingSave ||
                deleting ||
                equal(state, wish || wishInitialState)
              }
            />
          )}
        </div>
      </footer>
    </form>
  )
}

export default WishForm
