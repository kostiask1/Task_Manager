import { useCallback, useMemo, useState } from "react"
import AjaxSearch from "../../../components/AjaxSearch"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import Textarea from "../../../components/UI/Textarea"
import { equal } from "../../../helpers"
import { setError, setSuccess } from "../../../store/App/slice"
import { getAllUsers } from "../../../store/Auth/slice"
import { IUser } from "../../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import {
  deleteWish,
  editingWish,
  setWish,
  wishInitialState
} from "../../../store/Wish/slice"
import {
  Whitelist as IWhitelist,
  Wish as IWish
} from "../../../store/Wish/types"
import Whitelist from "../Whitelist"
import "./WishForm.scss"

const WishForm = () => {
  const dispatch = useAppDispatch()
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const wish: IWish | null = useAppSelector(
    (state: RootState) => state.wishes.editingWish
  )
  const wishes: IWish[] = useAppSelector(
    (state: RootState) => state.wishes.array
  )
  const [state, setState] = useState<IWish>(wish || wishInitialState)
  const [loadingSave, setLoadingSave] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

  const handleCompleted = (event: React.MouseEvent) => {
    event.preventDefault()
    setState((state: IWish) => ({ ...state, completed: !state.completed }))
  }

  const categories = useMemo(() => {
    const categories: string[] = []

    for (let i = 0; i < wishes.length; i++) {
      const wish = wishes[i]
      if (wish.category) {
        if (!categories.includes(wish.category)) {
          categories.push(wish.category)
        }
      }
    }

    const categories_Options: any = categories.map((category, index) => (
      <option value={category} key={category + index}></option>
    ))

    return categories_Options
  }, [wishes])

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

  const addUserToWhitelist = (id: string) => {
    if (state.whitelist.findIndex((user) => user.id === id) > -1) {
      dispatch(setError("User already in whitelist"))
      return
    }
    const newUser: IWhitelist = { id, read: true, write: false }
    setState((state: IWish) => ({
      ...state,
      whitelist: [...state.whitelist, newUser],
    }))
  }

  const transformer = (array: IUser[]) => {
    if (array.length) {
      const filteredArray = array.filter(u => !state.whitelist.map((u) => u.id).includes(u.id) && user.id !== u.id)
      return filteredArray && filteredArray.map(u => <div style={{width: "100%"}} onClick={() => addUserToWhitelist(u.id)} key={u.id}>{u.firstName} {u.lastName}</div>)
    }
    return null
  }

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
          {!!state.id && (
            <Button
              className={`complete-task-btn ${state.completed ? "is-primary" : "is-danger"
                }`}
              onClick={handleCompleted}
              text={`completed: ${state.completed ? "Yes" : "No"}`}
            />
          )}
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
            <datalist id="categories">{categories}</datalist>
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
        <div className="is-flex is-align-items-center mb-0">
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
        {state.open}
        {!state.open && <>
          <label className="mt-5 is-block" htmlFor="user">
            <b>Whitelist (users that can view this wish)</b>
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
          <AjaxSearch transformer={transformer} autoClose={false} responseParams={["firstName", "id", "lastName"]} request={getAllUsers} inputProps={
            {
              name: "user",
              className: "input mt-2",
              placeholder: "Start typing user Name, Surname or id (Expecting 28 characters)",
            }} />
        </>}
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
          {isEdit && (
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
          <Button
            onClick={clear}
            className="mx-2 card-footer-item is-warning"
            text="Clear"
            disabled={loadingSave || deleting}
          />
        </div>
      </footer>
    </form>
  )
}

export default WishForm
