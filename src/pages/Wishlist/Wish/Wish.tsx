import { FC, useState, useCallback } from "react"
import { Wish as IWish } from "../../../store/Wish/types"
import "./Wish.scss"
import { useAppDispatch } from "../../../store/store"
import { editingWish, setWish, deleteWish } from "../../../store/Wish/slice"
import Button from "../../../components/UI/Button"
import { setSuccess, setError } from "../../../store/App/slice"

interface WishInterface {
  wish: IWish
  editable: boolean
  index: number
}

const Wish: FC<WishInterface> = ({ wish, editable = false, index }) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const setEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: "smooth" })
    dispatch(editingWish(wish))
  }

  const complete = useCallback(async (wish: IWish, completed: boolean) => {
    if (wish) {
      setLoading(true)
      const saveWish: IWish = { ...wish }
      saveWish.completed = completed
      await dispatch(setWish(saveWish))
      setLoading(false)
      if (completed) {
        dispatch(setSuccess("Wish completed"))
      } else {
        dispatch(setError("Wish returned"))
      }
    }
  }, [])

  const deleteW = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setDeleting(true)
      await dispatch(deleteWish(wish))
      setDeleting(false)
      dispatch(setSuccess("Wish deleted successfully"))
    },
    [wish]
  )

  return (
    <>
      <td>{index + 1}</td>
      <td>{wish.title ?? "-"}</td>
      <td>{wish.price || "-"}</td>
      <td className="description">{wish.description ?? "-"}</td>
      <td>{wish.category ?? "-"}</td>
      <td>{wish.url ?? "-"}</td>
      <td>
        <Button
          className={`is-small ${wish.completed ? "is-primary" : "is-danger"}`}
          style={{ height: "100%" }}
          onClick={() => editable && complete(wish, !wish.completed)}
          text={`${
            loading
              ? "Updating..."
              : `Completed: ${wish.completed ? "Yes" : "No"}`
          }`}
          disabled={loading || deleting}
        />
      </td>
      <td>{wish.open ? "Open" : "Closed"}</td>
      {editable && (
        <>
          <td>{!!wish.openTo.length && wish.openTo.join(", ")}</td>
          <td>
            <div className="buttons">
              <Button
                className="is-info is-small"
                onClick={setEdit}
                text="Edit"
                disabled={loading || deleting}
              />
              <Button
                className="is-danger is-small"
                text={deleting ? "Deleting..." : "Delete"}
                onClick={deleteW}
                disabled={loading || deleting}
              />
            </div>
          </td>
        </>
      )}
    </>
  )
}

export default Wish
