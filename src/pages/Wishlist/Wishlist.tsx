import { lazy, Suspense, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import SecurityMiddleware from '../../components/SecurityMiddleware'
import Loader from "../../components/UI/Loader/Loader"
import Table, { ITableProps } from '../../components/UI/Table'
import { tableActions } from "../../helpers"
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

  const columns = [
    { title: "Title" },
    { title: "Price" },
    { title: "Description" },
    { title: "Category" },
    { title: "Url" },
    { title: "Completed" }
  ]
  const temp = [
    { title: "Open" },
    { title: "Whitelist" },
    { title: "Action", sorting: false },
  ]

  !foreignUser && columns.push(...temp)
  const body = data.map((wish: IWish, index) => (
    <Wish
      key={wish.id}
      wish={wish}
      editable={!foreignUser}
      index={wishes.indexOf(wish)}
    />
  ))

  const tableProps: ITableProps = {
    data,
    columns,
    body,
    loading,
    sorting,
    sort,
    reset,
    initData: wishes
  }

  const fallback = foreignUser && data.length ? "User have granted you access only to part of his wishlist" : "User haven't granted you access to his wishlist"
  return (
    <div className="section is-medium pt-2 pb-6">
      <SecurityMiddleware fallback={fallback} />
      {!foreignUser && <WishForm key={JSON.stringify(wish)} />}
      {!foreignUser && <hr />}
      <Suspense fallback={<Loader loading={true} />}>
        <Table
          {...tableProps}
        />
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default Wishlist
