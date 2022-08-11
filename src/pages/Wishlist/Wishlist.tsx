import { lazy, Suspense, useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Button from "../../components/UI/Button"
import Loader from "../../components/UI/Loader/Loader"
import { equal } from "../../helpers"
import { setError, setSuccess } from "../../store/App/slice"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getWishes } from "../../store/Wish/slice"
import { Wish as IWish } from "../../store/Wish/types"
import WishForm from "./WishForm/WishForm"
import "./Wishlist.scss"
const Wish = lazy(() => import("./Wish"))

type Column = keyof IWish

function isNumeric(value: any) {
  return /^-?\d+$/.test(value)
}

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

  useEffect(() => {
    setLoading(true)
    setData([])
    dispatch(getWishes(uid || user.id)).then(() => setLoading(false))
  }, [uid])

  useEffect(() => {
    setData(wishes)
  }, [wishes])

  const copyWishPage = useCallback(() => {
    navigator.clipboard
      .writeText(`${window.location.host}/wishes/${user.id}`)
      .then(
        () =>
          dispatch(setSuccess("Link to your wishlist is copied to clipboard")),
        () => dispatch(setError("Something went wrong"))
      )
  }, [user.id])

  const removeThHighlight = useCallback(() => {
    document.querySelectorAll("th").forEach((th) => {
      th.style.backgroundColor = ""
    })
  }, [])

  const sortData = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.currentTarget as HTMLTableCellElement
      const innerText = target.innerHTML
      removeThHighlight()
      target.style.backgroundColor = "lightblue"
      const column = (
        innerText.charAt(0).toLowerCase() + innerText.slice(1)
      ).replaceAll(" ", "") as Column
      const copy: IWish[] = [...data]
      const modifier = sorting === column ? -1 : 1
      copy.sort((a, b) => {
        if (typeof a[column] === "string" && !isNumeric(a[column])) {
          return (
            (a[column] as string).localeCompare(b[column] as string) * modifier
          )
        } else if (isNumeric(a[column])) {
          return (+a[column] - +b[column]) * modifier
        } else {
          if (a[column] < b[column]) return 1 * modifier
          if (a[column] > b[column]) return -1 * modifier
          return 0
        }
      })
      setSorting(sorting === column ? "" : column)
      setData(copy)
    },
    [data]
  )

  const reset = useCallback(() => {
    removeThHighlight()
    setSorting("")
    setData(wishes)
  }, [wishes])

  return (
    <div className="section is-medium pt-2 pb-6">
      {(!uid || uid === user.id) && (
        <Button
          onClick={copyWishPage}
          className="is-primary mb-3"
          text="Share Your Wishlist"
        />
      )}
      {(!uid || uid === user.id) && <WishForm key={JSON.stringify(wish)} />}
      {uid && uid !== user.id && <h2>Tasks of user ID: {uid}</h2>}
      <hr />
      <Suspense fallback={<Loader loading={true} />}>
        <div className="table-container">
          <table className="table is-striped is-bordered is-hoverable is-fullwidth is-narrow">
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
                <th onClick={sortData}>Title</th>
                <th onClick={sortData}>Price</th>
                <th onClick={sortData}>Description</th>
                <th onClick={sortData}>Category</th>
                <th onClick={sortData}>Url</th>
                <th onClick={sortData}>Completed</th>
                {(!uid || uid === user.id) && (
                  <>
                    <th onClick={sortData}>Open</th>
                    <th onClick={sortData}>Open To</th>
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
        </div>
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default Wishlist
