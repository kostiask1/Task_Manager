import { lazy, Suspense, useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import Loader from "../../components/UI/Loader/Loader"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getWishes } from "../../store/Wish/slice"
import { Wish as IWish } from "../../store/Wish/types"
import WishForm from "./WishForm/WishForm"
import "./Wishlist.scss"
import { setSuccess, setError } from "../../store/App/slice"
import Button from "../../components/UI/Button"
const Wish = lazy(() => import("./Wish"))

const Wishlist = () => {
  const dispatch = useAppDispatch()
  const wishes: IWish[] = useAppSelector(
    (state: RootState) => state.wishes.array
  )
  const wish: IWish | null = useAppSelector(
    (state: RootState) => state.wishes.editingWish
  )
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(!wishes.length)
    dispatch(getWishes(uid || user.id)).then(() => setLoading(false))
  }, [uid])

  const copyWishPage = useCallback(() => {
    navigator.clipboard
      .writeText(`${window.location.host}/wishes/${user.id}`)
      .then(
        () =>
          dispatch(setSuccess("Link to your wishlist is copied to clipboard")),
        () => dispatch(setError("Something went wrong"))
      )
  }, [user.id])

  return (
    <div className="pb-6">
      {!uid && (
        <Button
          onClick={copyWishPage}
          className="is-primary mb-3"
          text="Share Your Wishlist"
        />
      )}
      {!uid && <WishForm key={JSON.stringify(wish)} />}
      {uid && <h2>Tasks of user ID: {uid}</h2>}
      <hr />
      <Suspense fallback={<Loader loading={true} />}>
        <table className="table is-striped is-bordered is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Price</th>
              <th>Description</th>
              <th>Category</th>
              <th>URL</th>
              <th>Completed</th>
              <th>Open</th>
              <th>Open To</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!!wishes?.length ? (
              wishes.map((wish: IWish, index) => (
                <tr key={wish.id}>
                  <Wish
                    wish={wish}
                    editable={user.id == wish.uid}
                    index={index}
                  />
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>No wishes to be displayed...</td>
              </tr>
            )}
          </tbody>
        </table>
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default Wishlist
