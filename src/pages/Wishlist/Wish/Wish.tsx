import { FC, useCallback, useState } from "react"
import Button from "../../../components/UI/Button"
import { setError, setSuccess } from "../../../store/App/slice"
import { useAppDispatch } from "../../../store/store"
import { deleteWish, editingWish, setWish } from "../../../store/Wish/slice"
import { Wish as IWish } from "../../../store/Wish/types"
import Whitelist from "../Whitelist"

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

  const toggleOpen = useCallback(async (wish: IWish, open: boolean) => {
    if (wish) {
      setLoading(true)
      const saveWish: IWish = { ...wish }
      saveWish.open = open
      await dispatch(setWish(saveWish))
      setLoading(false)
      if (open) {
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
      <td>{wish.title}</td>
      <td>{wish.price || ""}</td>
      <td
        className="description"
        style={{
          minWidth: wish.description
            ? Math.min(wish.description.length * 4, 275)
            : 0,
        }}
      >
        {wish.description}
      </td>
      <td>
        <p>{wish.category}</p>
      </td>
      <td>
        {!!wish.url && (
          <a href={wish.url} target="_blank">
            Link
          </a>
        )}
      </td>
      <td>
        <Button
          className={`is-small ${wish.completed ? "primary" : "danger"}`}
          style={{ height: "100%" }}
          onClick={() => editable && complete(wish, !wish.completed)}
          text={`${
            loading
              ? "Updating..."
              : `Completed: ${wish.completed ? "Yes" : "No"}`
          }`}
          disabled={loading || deleting || !editable}
        />
      </td>
      {editable && (
        <>
          <td>
            <Button
              className={`is-small ${wish.open ? "primary" : "danger"}`}
              style={{ height: "100%" }}
              onClick={() => editable && toggleOpen(wish, !wish.open)}
              text={`${
                loading ? "Updating..." : `Open: ${wish.open ? "Yes" : "No"}`
              }`}
              disabled={loading || deleting || !editable}
            />
          </td>
          <td>
            <ul className="whitelist-users">
              {!!wish.whitelist?.length &&
                wish.whitelist.map((user, index) => (
                  <Whitelist
                    key={user.id + index}
                    data={user}
                    wish={wish}
                    editable={editable}
                  />
                ))}
            </ul>
          </td>
          <td>
            <div className="buttons">
              <Button
                className="info is-small"
                onClick={setEdit}
                text="Edit"
                disabled={loading || deleting}
              />
              <Button
                className="danger is-small"
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
