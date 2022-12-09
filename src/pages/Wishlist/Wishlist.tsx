import { lazy, Suspense, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loader from "../../components/UI/Loader/Loader"
import Table, { ITableProps } from '../../components/UI/Table'
import { IUser } from "../../store/Auth/types"
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
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()
  const [loading, setLoading] = useState(true)

  const foreignUser = uid !== undefined && user.id !== uid

  useEffect(() => {
    setLoading(true)
    dispatch(getWishes(uid || user.id)).then(() => setLoading(false))
  }, [uid])

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
  const renderBody = (wish: IWish) => (
    <Wish
      wish={wish}
      editable={!foreignUser}
      index={wishes.indexOf(wish)}
    />
  )

  const tableProps: ITableProps<IWish> = {
    columns,
    renderBody,
    loading,
    initData: wishes
  }

  return (
    <div className="section is-medium pt-2 pb-6">
      {!foreignUser && <WishForm key={JSON.stringify(wish)} />}
      {!foreignUser && <hr />}
      <Suspense fallback={<Loader loading={true} />}>
        <Table
          key={JSON.stringify(wishes)}
          {...tableProps}
        />
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default Wishlist
