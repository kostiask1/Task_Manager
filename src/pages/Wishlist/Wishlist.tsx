import { lazy, Suspense, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import SecurityMiddleware from '../../components/SecurityMiddleware'
import Button from "../../components/UI/Button"
import Loader from "../../components/UI/Loader/Loader"
import { equal, tableActions } from "../../helpers"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getWishes } from "../../store/Wish/slice"
import { Wish as IWish } from "../../store/Wish/types"
import WishForm from "./WishForm/WishForm"
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
  const [data, setData] = useState<IWish[]>(wishes)
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState("")
  const [sort, reset] = tableActions({
    data,
    setData,
    sorting,
    setSorting,
    initData: wishes,
  })

  const foreignUser = uid !== undefined && user.id !== uid

  useEffect(() => {
    setLoading(true)
    setData([])
    dispatch(getWishes(uid || user.id)).then(() => setLoading(false))
  }, [uid])

  useEffect(() => {
    setData(wishes)
  }, [wishes])
  
  const fallback = foreignUser && data.length ? "User have granted you access only to part of his wishlist" : "User haven't granted you access to his wishlist"
  return (
    <div className="section is-medium pt-2 pb-6">
      <SecurityMiddleware fallback={fallback}/>
      {!foreignUser && <WishForm key={JSON.stringify(wish)} />}
      {!foreignUser && <hr />}
      <Suspense fallback={<Loader loading={true} />}>
        <div className="table-container">
          <table className="table table-wishes is-striped is-bordered is-hoverable is-fullwidth is-narrow">
            <thead>
              <tr>
                <th>
                  <Button
                    text="Reset"
                    onClick={reset}
                    className={
                      !loading && (!equal(wishes, data) || sorting)
                        ? "is-danger"
                        : ""
                    }
                    disabled={equal(wishes, data) && !sorting}
                  />
                </th>
                <th onClick={sort}>Title</th>
                <th onClick={sort}>Price</th>
                <th onClick={sort}>Description</th>
                <th onClick={sort}>Category</th>
                <th onClick={sort}>Url</th>
                <th onClick={sort}>Completed</th>
                {!foreignUser && (
                  <>
                    <th onClick={sort}>Open</th>
                    <th onClick={sort}>Whitelist</th>
                    <th>Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {!!data?.length ? (
                data.map((wish: IWish, index) => (
                  <tr key={wish.id}>
                    <Wish
                      wish={wish}
                      editable={!foreignUser}
                      index={wishes.indexOf(wish)}
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
        </div>
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default Wishlist
