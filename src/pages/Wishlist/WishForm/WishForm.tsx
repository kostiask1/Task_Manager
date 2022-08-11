import { useAppDispatch, useAppSelector, RootState } from "../../../store/store"
import {
  editingWish,
  wishInitialState,
  setWish,
} from "../../../store/Wish/slice"
import { Wish as IWish } from "../../../store/Wish/types"
import "./WishForm.scss"
import { useState, useCallback } from "react"
import { setSuccess } from "../../../store/App/slice"
import { User } from "../../../store/Auth/types"
import Input from "../../../components/UI/Input"
import Button from "../../../components/UI/Button"
import { equal } from "../../../helpers"
import { deleteWish } from "../../../store/Wish/slice"
import Textarea from "../../../components/UI/Textarea"

const WishForm = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const wish: IWish | null = useAppSelector(
    (state: RootState) => state.wishes.editingWish
  )
  const [state, setState] = useState<IWish>(wish || wishInitialState)
  const [loadingSave, setLoadingSave] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

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

  const handleOpenTo = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) =>
    setState((state: IWish) => ({
      ...state,
      openTo: event.target.value.split(","),
    }))

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
        <div>
          <Input
            type="number"
            name="price"
            label="Price"
            min={0}
            value={state.price || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Textarea
            name="description"
            label="Description"
            value={state.description}
            maxLength={750}
            onChange={handleChange}
          />
        </div>
        <div>
          <Input
            name="category"
            label="Category"
            value={state.category}
            onChange={handleChange}
            maxLength={30}
          />
        </div>
        <div>
          <Input
            name="url"
            label="Url"
            value={state.url}
            onChange={handleChange}
            maxLength={300}
          />
        </div>
        <div>
          <label htmlFor="open">Open</label>
          <input
            type="checkbox"
            name="open"
            id="open"
            className="ml-2"
            checked={state.open}
            value={+state.open}
            onChange={handleOpen}
          />
        </div>
        <div>
          <Input
            name="openTo"
            label="OpenTo"
            value={state.openTo.join(",")}
            onChange={handleOpenTo}
            disabled={state.open}
          />
        </div>
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
